import { bucketIndex, buildHistogram } from './histogram';

describe('buildHistogram', () => {
  it('should count dates in equal spans of days', () => {
    expect(buildHistogram(['2026-01-01', '2026-01-04T10:00'], ['2026-01-04T10:00', '2026-01-03'], 2)).toEqual([
      { from: '2026-01-01', to: '2026-01-02', count: 0 },
      { from: '2026-01-03', to: '2026-01-04', count: 2 },
    ]);
  });

  it('should end the last span on the last day', () => {
    const buckets = buildHistogram(['2026-01-01', '2026-01-05'], [], 2);

    expect(buckets.map((bucket) => [bucket.from, bucket.to])).toEqual([
      ['2026-01-01', '2026-01-03'],
      ['2026-01-04', '2026-01-05'],
    ]);
  });

  it('should keep one bucket per day for short spans', () => {
    expect(buildHistogram(['2026-03-02'], ['2026-03-02'], 40)).toEqual([
      { from: '2026-03-02', to: '2026-03-02', count: 1 },
    ]);
  });

  it('should give no buckets without dates', () => {
    expect(buildHistogram([], [], 40)).toEqual([]);
  });
});

describe('bucketIndex', () => {
  const buckets = buildHistogram(['2026-01-01', '2026-01-06'], [], 3);

  it('should find the bucket holding a date', () => {
    expect(bucketIndex(buckets, '2026-01-04', 0)).toBe(1);
  });

  it('should snap dates outside the buckets to the nearest end', () => {
    expect(bucketIndex(buckets, '2025-12-01', 0)).toBe(0);
    expect(bucketIndex(buckets, '2027-01-01', 0)).toBe(2);
  });

  it('should use the fallback for an empty date', () => {
    expect(bucketIndex(buckets, '', 2)).toBe(2);
  });
});
