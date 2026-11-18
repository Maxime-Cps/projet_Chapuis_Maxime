import { Pollution } from '../../interfaces/Pollution';
import { MapPoint } from '../../map/city-map';
import { toGeoPosition } from '../../utils/geo';
import { LEVEL_SEVERITY, LEVEL_TOKENS, toPollutionLevel } from '../../utils/pollution-level';

/** One dot per pollution, colored by level. Pollutions without valid coordinates are left out. */
export function toMapPoints(pollutions: readonly Pollution[]): MapPoint[] {
  const points: MapPoint[] = [];
  for (const pollution of pollutions) {
    const position = toGeoPosition(pollution.latitude, pollution.longitude);
    if (position === null) {
      continue;
    }

    const level = toPollutionLevel(pollution.dangerLevel);
    points.push({ id: pollution.id, position, colorToken: LEVEL_TOKENS[level], severity: LEVEL_SEVERITY[level] });
  }

  return points;
}
