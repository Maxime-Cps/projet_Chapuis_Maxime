import { GeoPosition } from '../interfaces/GeoPosition';

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

/** Decimals kept for a picked coordinate: 6 is about 0.1 m. */
const COORDINATE_DECIMALS = 6;

type RawCoordinate = string | number | null | undefined;

/**
 * Reads a position from raw latitude and longitude, as the API (strings) or the form (numbers) hold them.
 * Returns null when one is missing, not a number or out of range.
 *
 * @example toGeoPosition('48.85', 2.34) -> { latitude: 48.85, longitude: 2.34 }
 * @example toGeoPosition('', 2.34) -> null
 */
export function toGeoPosition(latitude: RawCoordinate, longitude: RawCoordinate): GeoPosition | null {
  const lat = toNumber(latitude);
  const lng = toNumber(longitude);
  if (lat === null || lng === null) {
    return null;
  }

  if (Math.abs(lat) > MAX_LATITUDE || Math.abs(lng) > MAX_LONGITUDE) {
    return null;
  }

  return { latitude: lat, longitude: lng };
}

/** Rounds both coordinates to 6 decimals, e.g. 48.856613456 -> 48.856613. */
export function roundPosition(position: GeoPosition): GeoPosition {
  return {
    latitude: Number(position.latitude.toFixed(COORDINATE_DECIMALS)),
    longitude: Number(position.longitude.toFixed(COORDINATE_DECIMALS)),
  };
}

function toNumber(value: RawCoordinate): number | null {
  if (value == null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
