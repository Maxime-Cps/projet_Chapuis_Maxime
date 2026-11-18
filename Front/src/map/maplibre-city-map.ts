import type {
  ExpressionSpecification,
  GeoJSONSource,
  LngLat,
  Map as MaplibreMap,
  MapLayerMouseEvent,
  Marker,
} from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import { GeoPosition } from '../interfaces/GeoPosition';
import { Beacon, CityMap, CityMapOptions, MapPadding, MapPoint, MapView, PinMode } from './city-map';
import { cityStyle, readToken } from './map-style';
import type { BeaconLayer } from './beacon-layer';

type BeaconModule = typeof import('./beacon-layer');

export type Maplibre = typeof import('maplibre-gl');

/** Source of the dots, grouped when close; also the id of the layer of single dots. */
const POINTS = 'points';
const CLUSTERS = 'clusters';
const CLUSTER_COUNT = 'cluster-count';
const HIGHLIGHT = 'highlight';
const HEAT = 'heat';

const POINT_RADIUS = 7;
const HIGHLIGHTED_RADIUS = 10;
const POINT_OUTLINE = 2;

/** Dots closer than this, in pixels, are grouped up to {@link CLUSTER_MAX_ZOOM}. */
const CLUSTER_RADIUS = 48;
const CLUSTER_MAX_ZOOM = 14;

/** Group radius by number of dots: 14 px, 18 px from 10 dots, 22 px from 50. */
const CLUSTER_SIZES: ExpressionSpecification = ['step', ['get', 'point_count'], 14, 10, 18, 50, 22];

/** Heat spread around a dot in pixels, by zoom: 25 px at zoom 10, 60 px at 16. */
const HEAT_RADIUS: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 10, 25, 16, 60];

/** Heat boost by zoom, so a few reports already reach the warm colors. */
const HEAT_INTENSITY: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 3];

/** Highest severity of {@link MapPoint}, weighing a dot fully in the heat map. */
const MAX_SEVERITY = 4;

/** Least tilt and zoom to show a beacon: a column of 30 m is a dot from farther. */
const BEACON_PITCH = 55;
const BEACON_ZOOM = 15.5;

/** Room kept around the results when framing them, in pixels. */
const FIT_PADDING = 48;

/** Closest zoom when framing results, so a single report keeps its street around it. */
const FIT_MAX_ZOOM = 15;

/** {@link CityMap} drawn by MapLibre GL. Created by `MapEngine` once the library is loaded. */
export class MaplibreCityMap implements CityMap {
  private readonly map: MaplibreMap;
  private readonly pin: Marker | null;

  /** Settles once the style is loaded: sources and layers can only be added after. */
  private readonly loaded: Promise<void>;

  private highlightedId: number | null = null;
  private pinShown = false;
  private points = new Map<number, MapPoint>();

  /** Beacon asked for last: three.js may still be loading. */
  private wantedBeacon: Beacon | null = null;
  private beaconModule: Promise<BeaconModule> | null = null;
  private beaconLayer: BeaconLayer | null = null;
  private destroyed = false;

  constructor(
    private readonly lib: Maplibre,
    private readonly options: CityMapOptions,
  ) {
    this.map = new lib.Map({
      container: options.container,
      style: cityStyle(),
      center: toLngLat(options.center),
      zoom: options.zoom,
      pitch: options.pitch ?? 0,
      bearing: options.bearing ?? 0,
      attributionControl: { compact: true },
    });

    this.pin = options.pin ? new lib.Marker({ element: options.pin, draggable: true }) : null;
    this.pin?.on('dragend', () => options.onPinMove?.(toPosition(this.pin!.getLngLat())));

    this.map.on('click', (event) => {
      // Clicks on the pin or on controls are not picks
      if (event.originalEvent.target !== this.map.getCanvas()) {
        return;
      }

      options.onMapClick?.(toPosition(event.lngLat));
    });
    this.loaded = new Promise((resolve) => this.map.once('load', () => resolve()));
    this.loaded.then(() => this.addPoints());
  }

  setPoints(points: readonly MapPoint[]) {
    this.points = new Map(points.map((point) => [point.id, point]));

    this.loaded.then(() => {
      const colors = new Map<string, string>();
      const colorOf = (token: string) => {
        const color = colors.get(token) ?? readToken(token);
        colors.set(token, color);
        return color;
      };

      const data = this.toFeatures(points, colorOf);
      this.map.getSource<GeoJSONSource>(POINTS)?.setData(data);
      this.map.getSource<GeoJSONSource>(HEAT)?.setData(data);
      this.colorClusters(points, colorOf);
      this.drawHighlight();
    });
  }

  highlight(id: number | null) {
    this.highlightedId = id;
    this.loaded.then(() => this.drawHighlight());
  }

  setView(view: MapView) {
    this.loaded.then(() => {
      const heat = view === MapView.Heat;
      this.map.setLayoutProperty(HEAT, 'visibility', heat ? 'visible' : 'none');
      for (const layer of [CLUSTERS, CLUSTER_COUNT, POINTS, HIGHLIGHT]) {
        this.map.setLayoutProperty(layer, 'visibility', heat ? 'none' : 'visible');
      }
    });
  }

  setBeacon(beacon: Beacon | null) {
    this.wantedBeacon = beacon;

    if (beacon === null) {
      this.removeBeacon();
      return;
    }

    this.map.easeTo({
      center: toLngLat(beacon.position),
      zoom: Math.max(this.map.getZoom(), BEACON_ZOOM),
      pitch: Math.max(this.map.getPitch(), BEACON_PITCH),
    });

    this.beaconModule ??= Promise.all([import('./beacon-layer'), this.loaded]).then(([module]) => module);
    this.beaconModule.then((module) => this.showBeacon(module));
  }

  fit(positions: readonly GeoPosition[]) {
    if (positions.length === 0) {
      return;
    }

    const bounds = new this.lib.LngLatBounds();
    for (const position of positions) {
      bounds.extend(toLngLat(position));
    }

    this.map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM });
  }

  setPin(position: GeoPosition | null) {
    if (!this.pin) {
      return;
    }

    if (position === null) {
      this.pin.remove();
      this.pinShown = false;
      return;
    }

    const lngLat = toLngLat(position);
    this.pin.setLngLat(lngLat);
    if (!this.pinShown) {
      this.pin.addTo(this.map);
      this.pinShown = true;
    }

    if (!this.isInView(lngLat)) {
      this.map.easeTo({ center: lngLat });
    }
  }

  setPinMode(mode: PinMode) {
    this.pin?.setDraggable(mode === PinMode.Movable);
  }

  centerOn(position: GeoPosition, zoom: number) {
    this.map.easeTo({ center: toLngLat(position), zoom });
  }

  setPadding(padding: MapPadding) {
    const current = this.map.getPadding();
    if (current.left === padding.left && current.right === padding.right) {
      return;
    }

    // Setting padding stops the camera: let a move end first, e.g. the tilt onto a beacon
    if (this.map.isMoving()) {
      this.map.once('moveend', () => this.setPadding(padding));
      return;
    }

    this.map.setPadding({ ...padding, top: 0, bottom: 0 });
  }

  destroy() {
    this.destroyed = true;
    this.removeBeacon();
    this.map.remove();
  }

  /** Draws the wanted beacon once three.js is loaded, unless the map or the beacon is gone meanwhile. */
  private showBeacon({ BeaconLayer }: BeaconModule) {
    const beacon = this.wantedBeacon;
    if (this.destroyed || beacon === null) {
      return;
    }

    if (this.beaconLayer) {
      this.beaconLayer.set(beacon);
      return;
    }

    this.beaconLayer = new BeaconLayer(this.lib, beacon);
    this.map.addLayer(this.beaconLayer);
  }

  /** Removes the beacon, whose layer frees its GPU resources, and levels the camera back. */
  private removeBeacon() {
    if (!this.beaconLayer) {
      return;
    }

    this.map.removeLayer(this.beaconLayer.id);
    this.beaconLayer = null;
    if (!this.destroyed) {
      this.map.easeTo({ pitch: this.options.pitch ?? 0 });
    }
  }

  private toFeatures(points: readonly MapPoint[], colorOf: (token: string) => string): FeatureCollection<Point> {
    return {
      type: 'FeatureCollection',
      features: points.map((point) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: toLngLat(point.position) },
        // The id is a property too: grouping keeps properties, not always feature ids
        properties: { id: point.id, color: colorOf(point.colorToken), severity: point.severity },
      })),
    };
  }

  /** Colors each group like its most severe dot, e.g. a group holding a dangerous dot is red. */
  private colorClusters(points: readonly MapPoint[], colorOf: (token: string) => string) {
    const colors = Array.from({ length: MAX_SEVERITY + 1 }, () => readToken('--accent'));
    for (const point of points) {
      colors[point.severity] = colorOf(point.colorToken);
    }

    this.map.setPaintProperty(CLUSTERS, 'circle-color', [
      'to-color',
      ['at', ['get', 'severity'], ['literal', colors]],
    ]);
  }

  /** Draws the highlighted dot on its own layer, above groups that may hide it. */
  private drawHighlight() {
    const point = this.highlightedId === null ? undefined : this.points.get(this.highlightedId);
    const data = this.toFeatures(point ? [point] : [], readToken);
    this.map.getSource<GeoJSONSource>(HIGHLIGHT)?.setData(data);
  }

  /** Whether a position lies in the visible part of the map, padding excluded. */
  private isInView(lngLat: [number, number]): boolean {
    const point = this.map.project(lngLat);
    const { left = 0, right = 0, top = 0, bottom = 0 } = this.map.getPadding();
    const { clientWidth, clientHeight } = this.map.getContainer();

    return (
      point.x >= left &&
      point.x <= clientWidth - right &&
      point.y >= top &&
      point.y <= clientHeight - bottom
    );
  }

  /** Dots grouped when close, highlighted dot, heat map; hover and click on dots and groups. */
  private addPoints() {
    const empty: FeatureCollection = { type: 'FeatureCollection', features: [] };
    const dot = (radius: number, outline: string) => ({
      'circle-color': ['get', 'color'] as ExpressionSpecification,
      'circle-radius': radius,
      'circle-stroke-width': POINT_OUTLINE,
      'circle-stroke-color': outline,
    });

    this.map.addSource(HEAT, { type: 'geojson', data: empty });
    this.map.addSource(POINTS, {
      type: 'geojson',
      data: empty,
      cluster: true,
      clusterRadius: CLUSTER_RADIUS,
      clusterMaxZoom: CLUSTER_MAX_ZOOM,
      clusterProperties: { severity: ['max', ['get', 'severity']] },
    });
    this.map.addSource(HIGHLIGHT, { type: 'geojson', data: empty });

    this.map.addLayer({
      id: HEAT,
      type: 'heatmap',
      source: HEAT,
      layout: { visibility: 'none' },
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'severity'], 0, 0.2, MAX_SEVERITY, 1],
        'heatmap-radius': HEAT_RADIUS,
        'heatmap-intensity': HEAT_INTENSITY,
        'heatmap-opacity': 0.85,
        // Density shown with the level colors, from faint to dangerous
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'transparent',
          0.2,
          readToken('--level-low'),
          0.45,
          readToken('--level-moderate'),
          0.7,
          readToken('--level-high'),
          1,
          readToken('--level-dangerous'),
        ],
      },
    });
    this.map.addLayer({
      id: CLUSTERS,
      type: 'circle',
      source: POINTS,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': readToken('--accent'),
        'circle-radius': CLUSTER_SIZES,
        'circle-stroke-width': POINT_OUTLINE,
        'circle-stroke-color': readToken('--bg'),
      },
    });
    this.map.addLayer({
      id: CLUSTER_COUNT,
      type: 'symbol',
      source: POINTS,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: { 'text-color': readToken('--on-accent') },
    });
    this.map.addLayer({
      id: POINTS,
      type: 'circle',
      source: POINTS,
      filter: ['!', ['has', 'point_count']],
      paint: dot(POINT_RADIUS, readToken('--bg')),
    });
    this.map.addLayer({
      id: HIGHLIGHT,
      type: 'circle',
      source: HIGHLIGHT,
      paint: dot(HIGHLIGHTED_RADIUS, readToken('--text')),
    });

    const { onPointHover, onPointClick } = this.options;
    const canvas = this.map.getCanvas();

    this.map.on('mousemove', POINTS, (event) => {
      const id = pointId(event);
      if (id === null) {
        return;
      }

      canvas.style.cursor = onPointClick ? 'pointer' : '';
      onPointHover?.(id);
    });

    this.map.on('mouseleave', POINTS, () => {
      canvas.style.cursor = '';
      onPointHover?.(null);
    });

    this.map.on('click', POINTS, (event) => {
      const id = pointId(event);
      if (id !== null) {
        onPointClick?.(id);
      }
    });

    this.map.on('mouseenter', CLUSTERS, () => (canvas.style.cursor = 'zoom-in'));
    this.map.on('mouseleave', CLUSTERS, () => (canvas.style.cursor = ''));
    this.map.on('click', CLUSTERS, (event) => this.openCluster(event));
  }

  /** Zooms in until a clicked group splits. */
  private async openCluster(event: MapLayerMouseEvent) {
    const feature = event.features?.[0];
    const clusterId = feature?.properties['cluster_id'];
    if (!feature || typeof clusterId !== 'number' || feature.geometry.type !== 'Point') {
      return;
    }

    const zoom = await this.map.getSource<GeoJSONSource>(POINTS)!.getClusterExpansionZoom(clusterId);
    this.map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
  }
}

/** Id of the report under the mouse, or null. */
function pointId(event: MapLayerMouseEvent): number | null {
  const id = event.features?.[0]?.properties['id'];
  return typeof id === 'number' ? id : null;
}

function toLngLat(position: GeoPosition): [number, number] {
  return [position.longitude, position.latitude];
}

function toPosition(lngLat: LngLat): GeoPosition {
  return { latitude: lngLat.lat, longitude: lngLat.lng };
}
