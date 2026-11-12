/** Status of a pollution, derived from its danger index. */
export enum PollutionLevel {
  Low = 'Faible',
  Moderate = 'Modérée',
  High = 'Élevée',
  Dangerous = 'Dangereuse',
  /** No index known, e.g. a pollution saved before the field existed. */
  Unknown = 'Non renseignée',
}

/** Highest danger index of each level, the rest being Dangerous. */
const LEVEL_MAX = {
  low: 20,
  moderate: 50,
  high: 100,
} as const;

/** Maps a danger index to its level, e.g. 35 -> Moderate, undefined -> Unknown. */
export function toPollutionLevel(index: number | null | undefined): PollutionLevel {
  if (index == null || !Number.isFinite(index)) {
    return PollutionLevel.Unknown;
  }

  if (index <= LEVEL_MAX.low) {
    return PollutionLevel.Low;
  }

  if (index <= LEVEL_MAX.moderate) {
    return PollutionLevel.Moderate;
  }

  if (index <= LEVEL_MAX.high) {
    return PollutionLevel.High;
  }

  return PollutionLevel.Dangerous;
}
