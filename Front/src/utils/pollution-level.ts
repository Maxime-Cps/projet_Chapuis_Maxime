import { PollutionLevel } from '../interfaces/PollutionLevel';

/** Highest danger index of each level, the rest being Dangerous. */
const LEVEL_MAX = {
  low: 20,
  moderate: 50,
  high: 100,
} as const;

/** Largest danger index the API stores (Postgres INTEGER). */
export const MAX_DANGER_LEVEL = 2_147_483_647;

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
