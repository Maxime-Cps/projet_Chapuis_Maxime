import { GeoPosition } from '../interfaces/GeoPosition';

/**
 * Map layer of the app. Screens never touch the map library:
 *
 *   PollutionList ─┐                        ┌─ CityMap (this API)
 *                  ├─ PollutionMap ─────────┤
 *   PollutionForm ─┴─ LocationPicker ───────┘     │
 *                                                 ▼
 *                              MapEngine ── MaplibreCityMap ── maplibre-gl
 *                                                 │
 *                                                 └── BeaconLayer ── three (loaded with the first beacon)
 */

/** A dot on the map, colored with a design token, e.g. `--level-high`. */
export interface MapPoint {
  id: number;
  position: GeoPosition;
  colorToken: string;
  /** Rank of the dot, 0 or more: weighs it in the heat map, colors its group with the highest. */
  severity: number;
}

/** How the dots are drawn: one by one (grouped when close), or as a heat map. */
export enum MapView {
  Points = 'points',
  Heat = 'heat',
}

/** Particles a beacon gives off. */
export enum ParticleKind {
  None = 'none',
  Smoke = 'smoke',
  Drops = 'drops',
  Fragments = 'fragments',
}

/** A 3D column standing on the map, e.g. a saved report. */
export interface Beacon {
  position: GeoPosition;
  /** Height of the column, in meters. */
  height: number;
  colorToken: string;
  particles: ParticleKind;
}

/** Whether the pin follows clicks and drags, or stays put, e.g. once the report is saved. */
export enum PinMode {
  Movable = 'movable',
  Fixed = 'fixed',
}

/** Width hidden on each side of the map, e.g. under a panel, in pixels. */
export interface MapPadding {
  left: number;
  right: number;
}

/** What a map is created with. Callbacks are optional: a map without them is read-only. */
export interface CityMapOptions {
  container: HTMLElement;
  center: GeoPosition;
  zoom: number;
  /** Tilt of the camera in degrees, 0 (default) looking straight down. */
  pitch?: number;
  /** Rotation of the camera in degrees, 0 (default) with north up. */
  bearing?: number;
  /** Element shown as the draggable pin, see {@link CityMap.setPin}. */
  pin?: HTMLElement;
  onPointHover?: (id: number | null) => void;
  onPointClick?: (id: number) => void;
  onMapClick?: (position: GeoPosition) => void;
  onPinMove?: (position: GeoPosition) => void;
}

/** A live map drawn with the app's tokens. */
export interface CityMap {
  /** Replaces the dots on the map. */
  setPoints(points: readonly MapPoint[]): void;

  /** Puts one dot forward (bigger, light outline, above groups), or none with null. */
  highlight(id: number | null): void;

  /** Draws the dots one by one or as a heat map. */
  setView(view: MapView): void;

  /**
   * Drops a 3D beacon at its position and brings the camera onto it, close and tilted,
   * or removes it with null.
   * Particles flow for 15 s after the landing. Under reduced motion, it stands still without particles.
   */
  setBeacon(beacon: Beacon | null): void;

  /** Moves the camera so every position is in view. Does nothing without positions. */
  fit(positions: readonly GeoPosition[]): void;

  /** Shows the pin at a position, recentering if it is out of view, or hides it with null. */
  setPin(position: GeoPosition | null): void;

  /** Lets the pin be dragged, or not. */
  setPinMode(mode: PinMode): void;

  /** Moves the camera onto a position at a given zoom. */
  centerOn(position: GeoPosition, zoom: number): void;

  /** Keeps the camera clear of hidden sides: centering and the pin's "in view" check use the rest. */
  setPadding(padding: MapPadding): void;

  /** Frees the map and its GPU resources. */
  destroy(): void;
}
