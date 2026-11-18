import { GeoPosition } from '../interfaces/GeoPosition';

/**
 * Map layer of the app. Screens never touch the map library:
 *
 *   PollutionList ─┐                        ┌─ CityMap (this API)
 *                  ├─ PollutionMap ─────────┤
 *   PollutionForm ─┴─ LocationPicker ───────┘     │
 *                                                 ▼
 *                              MapEngine ── MaplibreCityMap ── maplibre-gl
 */

/** A dot on the map, colored with a design token, e.g. `--level-high`. */
export interface MapPoint {
  id: number;
  position: GeoPosition;
  colorToken: string;
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

  /** Puts one dot forward (bigger, light outline), or none with null. */
  highlight(id: number | null): void;

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
