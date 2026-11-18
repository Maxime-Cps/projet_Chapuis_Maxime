import { Beacon, ParticleKind } from '../../map/city-map';
import { GeoPosition } from '../../interfaces/GeoPosition';
import { LEVEL_TOKENS, toPollutionLevel } from '../../utils/pollution-level';

/** Column heights in meters: a report without index, and the bounds for known ones. */
const UNKNOWN_HEIGHT = 25;
const MIN_HEIGHT = 30;
const MAX_HEIGHT = 220;

/** Meters added per power of ten of the index: 0 -> 30 m, 9 -> 60 m, 99 -> 90 m. */
const METERS_PER_DECADE = 30;

/** Particles of each pollution type, by type id (see POLLUTION_TYPES). */
const PARTICLES_BY_TYPE: Readonly<Record<number, ParticleKind>> = {
  0: ParticleKind.Fragments, // Plastique
  1: ParticleKind.Smoke, // Chimique
  2: ParticleKind.Fragments, // Dépôt sauvage
  3: ParticleKind.Drops, // Eau
  4: ParticleKind.Smoke, // Air
};

/**
 * Height of a report's column: grows with the order of magnitude of the danger index,
 * so 2 000 000 000 stays on screen next to 10.
 *
 * @example beaconHeight(99) -> 90
 */
export function beaconHeight(dangerLevel: number | null): number {
  if (dangerLevel === null || !Number.isFinite(dangerLevel) || dangerLevel < 0) {
    return UNKNOWN_HEIGHT;
  }

  return Math.min(MAX_HEIGHT, MIN_HEIGHT + METERS_PER_DECADE * Math.log10(1 + dangerLevel));
}

/** @example particlesOf(3) -> Drops (water) */
export function particlesOf(typeId: number | null | undefined): ParticleKind {
  return typeId == null ? ParticleKind.None : (PARTICLES_BY_TYPE[typeId] ?? ParticleKind.None);
}

/** Beacon of a report: column as high as it is dangerous, in its level color, particles by type. */
export function toBeacon(position: GeoPosition, typeId: number | null | undefined, dangerLevel: number | null): Beacon {
  return {
    position,
    height: beaconHeight(dangerLevel),
    colorToken: LEVEL_TOKENS[toPollutionLevel(dangerLevel)],
    particles: particlesOf(typeId),
  };
}
