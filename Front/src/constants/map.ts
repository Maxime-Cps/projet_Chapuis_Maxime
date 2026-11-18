import { GeoPosition } from '../interfaces/GeoPosition';

/** View shown before any report is placed: central Paris. */
export const DEFAULT_CENTER: GeoPosition = { latitude: 48.8566, longitude: 2.3522 };

/** Zoom of the default view: the whole city. */
export const DEFAULT_ZOOM = 11;

/** Zoom when opening on a known position: street level. */
export const STREET_ZOOM = 15;

/** Shown in place of a map where it cannot be drawn. */
export const MAP_UNAVAILABLE = 'Carte indisponible sur ce navigateur.';

/** Camera of the 3D scene of a report: close and tilted, so buildings and the column show in relief. */
export const SCENE_CAMERA = { zoom: 16, pitch: 55, bearing: -20 } as const;

/** Tilt of the list map, in degrees: buildings show in relief once zoomed in. */
export const LIST_PITCH = 40;
