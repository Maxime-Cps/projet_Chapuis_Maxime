import { GeoPosition } from '../interfaces/GeoPosition';

/** View shown before any report is placed: central Paris. */
export const DEFAULT_CENTER: GeoPosition = { latitude: 48.8566, longitude: 2.3522 };

/** Zoom of the default view: the whole city. */
export const DEFAULT_ZOOM = 11;

/** Zoom when opening on a known position: street level. */
export const STREET_ZOOM = 15;

/** Shown in place of a map where it cannot be drawn. */
export const MAP_UNAVAILABLE = 'Carte indisponible sur ce navigateur.';
