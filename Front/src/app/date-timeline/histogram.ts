/** A span of days and the number of reports seen during it. Dates are `yyyy-MM-dd`, inclusive. */
export interface DayBucket {
  from: string;
  to: string;
  count: number;
}

const DAY_MS = 86_400_000;
const ISO_DATE_LENGTH = 'yyyy-MM-dd'.length;

/**
 * Splits the days covered by `domain` into at most `maxBuckets` equal spans, then counts
 * the dates of `counted` in each. Dates may carry a time (`2026-09-12T09:30`).
 *
 * @example buildHistogram(['2026-01-01', '2026-01-04'], ['2026-01-04'], 2)
 *   -> [{ from: '2026-01-01', to: '2026-01-02', count: 0 }, { from: '2026-01-03', to: '2026-01-04', count: 1 }]
 */
export function buildHistogram(
  domain: readonly string[],
  counted: readonly string[],
  maxBuckets: number,
): DayBucket[] {
  const days = domain.map(toDay).filter((day) => !Number.isNaN(day));
  if (days.length === 0) {
    return [];
  }

  const first = Math.min(...days);
  const last = Math.max(...days);
  const span = (last - first) / DAY_MS + 1;
  const width = Math.ceil(span / maxBuckets);
  const buckets: DayBucket[] = [];

  for (let start = first; start <= last; start += width * DAY_MS) {
    const end = Math.min(last, start + (width - 1) * DAY_MS);
    buckets.push({ from: toIso(start), to: toIso(end), count: 0 });
  }

  for (const day of counted.map(toDay)) {
    const index = Math.floor((day - first) / (width * DAY_MS));
    if (index >= 0 && index < buckets.length) {
      buckets[index].count++;
    }
  }

  return buckets;
}

/**
 * Index of the bucket holding a date, or `fallback` for an empty date.
 * Dates outside the buckets snap to the nearest end.
 */
export function bucketIndex(buckets: readonly DayBucket[], date: string, fallback: number): number {
  if (!date) {
    return fallback;
  }

  const index = buckets.findIndex((bucket) => date.slice(0, ISO_DATE_LENGTH) <= bucket.to);
  return index === -1 ? buckets.length - 1 : index;
}

function toDay(date: string): number {
  return Date.parse(date.slice(0, ISO_DATE_LENGTH));
}

function toIso(time: number): string {
  return new Date(time).toISOString().slice(0, ISO_DATE_LENGTH);
}
