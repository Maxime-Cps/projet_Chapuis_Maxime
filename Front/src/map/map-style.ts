import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl';

/** OpenFreeMap vector tiles (OpenMapTiles schema), free and without key. */
const TILES_URL = 'https://tiles.openfreemap.org/planet';
const GLYPHS_URL = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const LABEL_FONT = ['Noto Sans Regular'];
const SOURCE = 'openmaptiles';

const MAJOR_ROADS = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'];
const MINOR_ROADS = ['minor', 'service'];
const GREEN_COVER = ['wood', 'grass'];
const PLACES = ['city', 'town', 'village', 'suburb', 'quarter', 'neighbourhood'];

/** Zoom from which buildings and street names appear. */
const BUILDING_MIN_ZOOM = 13;

/** Height of buildings without one in the tiles, in meters. */
const BUILDING_DEFAULT_HEIGHT = 8;
const STREET_NAME_MIN_ZOOM = 14;

/** Reads a design token from the root element, e.g. readToken('--water') -> '#1d2b31'. */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Map style drawn with the map tokens of DESIGN.md, read at call time. */
export function cityStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS_URL,
    sources: { [SOURCE]: { type: 'vector', url: TILES_URL } },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': readToken('--land') } },
      fill('green-cover', 'landcover', readToken('--park'), inClass(GREEN_COVER)),
      fill('park', 'park', readToken('--park')),
      fill('water', 'water', readToken('--water')),
      {
        id: 'waterway',
        type: 'line',
        source: SOURCE,
        'source-layer': 'waterway',
        paint: { 'line-color': readToken('--water'), 'line-width': 1.5 },
      },
      road('street', MINOR_ROADS, readToken('--street'), [12, 0.5, 18, 10]),
      road('road', MAJOR_ROADS, readToken('--road'), [10, 1, 18, 18]),
      buildings(),
      {
        id: 'street-name',
        type: 'symbol',
        source: SOURCE,
        'source-layer': 'transportation_name',
        minzoom: STREET_NAME_MIN_ZOOM,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-font': LABEL_FONT,
          'text-size': 11,
        },
        paint: label(),
      },
      {
        id: 'place-name',
        type: 'symbol',
        source: SOURCE,
        'source-layer': 'place',
        filter: inClass(PLACES),
        layout: {
          'text-field': ['get', 'name'],
          'text-font': LABEL_FONT,
          'text-size': ['match', ['get', 'class'], ['city', 'town'], 14, 12],
        },
        paint: label(),
      },
    ],
  };
}

function fill(id: string, sourceLayer: string, color: string, filter?: ExpressionSpecification): LayerSpecification {
  return {
    id,
    type: 'fill',
    source: SOURCE,
    'source-layer': sourceLayer,
    ...(filter && { filter }),
    paint: { 'fill-color': color },
  };
}

/** Road line whose width grows with zoom, e.g. stops [12, 0.5, 18, 10]: 0.5 px at zoom 12, 10 px at 18. */
function road(id: string, classes: string[], color: string, stops: number[]): LayerSpecification {
  return {
    id,
    type: 'line',
    source: SOURCE,
    'source-layer': 'transportation',
    filter: inClass(classes),
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': color,
      'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], ...stops],
    },
  };
}

/** Buildings raised to their height from the tiles, seen in relief once the camera tilts. */
function buildings(): LayerSpecification {
  return {
    id: 'building',
    type: 'fill-extrusion',
    source: SOURCE,
    'source-layer': 'building',
    minzoom: BUILDING_MIN_ZOOM,
    paint: {
      'fill-extrusion-color': readToken('--building'),
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], BUILDING_DEFAULT_HEIGHT],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
    },
  };
}

function label() {
  return {
    'text-color': readToken('--muted'),
    'text-halo-color': readToken('--bg'),
    'text-halo-width': 1.5,
  };
}

function inClass(classes: string[]): ExpressionSpecification {
  return ['match', ['get', 'class'], classes, true, false];
}
