import { PollutionLevel } from '../interfaces/PollutionLevel';
import { PollutionLevelPipe } from './pollution-level-pipe';

describe('PollutionLevelPipe', () => {
  const pipe = new PollutionLevelPipe();

  const CASES: [number, PollutionLevel][] = [
    [0, PollutionLevel.Low],
    [20, PollutionLevel.Low],
    [21, PollutionLevel.Moderate],
    [50, PollutionLevel.Moderate],
    [51, PollutionLevel.High],
    [100, PollutionLevel.High],
    [101, PollutionLevel.Dangerous],
    [5000, PollutionLevel.Dangerous],
  ];

  for (const [index, level] of CASES) {
    it(`should turn ${index} into ${level}`, () => {
      expect(pipe.transform(index)).toBe(level);
    });
  }

  it('should report a missing index as unknown', () => {
    expect(pipe.transform(undefined)).toBe(PollutionLevel.Unknown);
    expect(pipe.transform(null)).toBe(PollutionLevel.Unknown);
  });
});
