import type {
  ExpressionSpecification,
  GeoJSONSource,
  LngLat,
  Map as MaplibreMap,
  Marker,
} from 'maplibre-gl';
import { GeoPosition } from '../interfaces/GeoPosition';
import { CityMap, CityMapOptions, MapPadding, MapPoint, PinMode } from './city-map';
import { cityStyle, readToken } from './map-style';

export type Maplibre = typeof import('maplibre-gl');

const POINTS = 'points';
const HIGHLIGHTED = 'highlighted';

const POINT_RADIUS = 7;
const HIGHLIGHTED_RADIUS = 10;
const POINT_OUTLINE = 2;

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

  constructor(
    private readonly lib: Maplibre,
    private readonly options: CityMapOptions,
  ) {
    this.map = new lib.Map({
      container: options.container,
      style: cityStyle(),
      center: toLngLat(options.center),
      zoom: options.zoom,
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
    this.loaded.then(() => {
      const colors = new Map<string, string>();
      const colorOf = (token: string) => {
        const color = colors.get(token) ?? readToken(token);
        colors.set(token, color);
        return color;
      };

      this.map.getSource<GeoJSONSource>(POINTS)?.setData({
        type: 'FeatureCollection',
        features: points.map((point) => ({
          type: 'Feature',
          id: point.id,
          geometry: { type: 'Point', coordinates: toLngLat(point.position) },
          properties: { color: colorOf(point.colorToken) },
        })),
      });
    });
  }

  highlight(id: number | null) {
    this.loaded.then(() => {
      if (this.highlightedId !== null) {
        this.map.setFeatureState({ source: POINTS, id: this.highlightedId }, { [HIGHLIGHTED]: false });
      }

      if (id !== null) {
        this.map.setFeatureState({ source: POINTS, id }, { [HIGHLIGHTED]: true });
      }

      this.highlightedId = id;
    });
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
    this.map.setPadding({ ...padding, top: 0, bottom: 0 });
  }

  destroy() {
    this.map.remove();
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

  /** Dots source and layer, with hover and click on dots. */
  private addPoints() {
    const isHighlighted: ExpressionSpecification = ['boolean', ['feature-state', HIGHLIGHTED], false];

    this.map.addSource(POINTS, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    this.map.addLayer({
      id: POINTS,
      type: 'circle',
      source: POINTS,
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['case', isHighlighted, HIGHLIGHTED_RADIUS, POINT_RADIUS],
        'circle-stroke-width': POINT_OUTLINE,
        'circle-stroke-color': ['case', isHighlighted, readToken('--text'), readToken('--bg')],
      },
    });

    const { onPointHover, onPointClick } = this.options;
    const canvas = this.map.getCanvas();

    this.map.on('mousemove', POINTS, (event) => {
      const id = event.features?.[0]?.id;
      if (typeof id !== 'number') {
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
      const id = event.features?.[0]?.id;
      if (typeof id === 'number') {
        onPointClick?.(id);
      }
    });
  }
}

function toLngLat(position: GeoPosition): [number, number] {
  return [position.longitude, position.latitude];
}

function toPosition(lngLat: LngLat): GeoPosition {
  return { latitude: lngLat.lat, longitude: lngLat.lng };
}
