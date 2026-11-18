import { PollutionLevel } from '../interfaces/PollutionLevel';

/** Highest danger index of each level, the rest being Dangerous. */
const LEVEL_MAX = {
  low: 20,
  moderate: 50,
  high: 100,
} as const;

/** Color token of each level, from DESIGN.md. */
export const LEVEL_TOKENS: Record<PollutionLevel, string> = {
  [PollutionLevel.Low]: '--level-low',
  [PollutionLevel.Moderate]: '--level-moderate',
  [PollutionLevel.High]: '--level-high',
  [PollutionLevel.Dangerous]: '--level-dangerous',
  [PollutionLevel.Unknown]: '--muted',
};

/** Rank of each level, from unknown (0) to dangerous (4), e.g. to weigh or compare reports. */
export const LEVEL_SEVERITY: Record<PollutionLevel, number> = {
  [PollutionLevel.Unknown]: 0,
  [PollutionLevel.Low]: 1,
  [PollutionLevel.Moderate]: 2,
  [PollutionLevel.High]: 3,
  [PollutionLevel.Dangerous]: 4,
};

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

/** Share of the gauge given to each of the four known levels. */
const GAUGE_STEP = 0.25;

/**
 * Position of a danger index on a gauge from 0 to 1, a quarter per level: linear inside
 * the first three levels, logarithmic in the last one up to {@link MAX_DANGER_LEVEL}.
 *
 * @example gaugeFraction(10) -> 0.125 (middle of Low)
 * @example gaugeFraction(null) -> 0
 */
export function gaugeFraction(index: number | null | undefined): number {
  if (index == null || !Number.isFinite(index) || index <= 0) {
    return 0;
  }

  const bounds = [0, LEVEL_MAX.low, LEVEL_MAX.moderate, LEVEL_MAX.high];
  for (let step = 1; step < bounds.length; step++) {
    if (index <= bounds[step]) {
      const within = (index - bounds[step - 1]) / (bounds[step] - bounds[step - 1]);
      return (step - 1 + within) * GAUGE_STEP;
    }
  }

  const within = Math.log10(index / LEVEL_MAX.high) / Math.log10(MAX_DANGER_LEVEL / LEVEL_MAX.high);
  return Math.min(1, (bounds.length - 1 + within) * GAUGE_STEP);
}
