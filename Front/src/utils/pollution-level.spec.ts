import { gaugeFraction, MAX_DANGER_LEVEL } from './pollution-level';

describe('gaugeFraction', () => {
  it('should give a quarter of the gauge to each level', () => {
    expect(gaugeFraction(10)).toBe(0.125);
    expect(gaugeFraction(20)).toBe(0.25);
    expect(gaugeFraction(50)).toBe(0.5);
    expect(gaugeFraction(100)).toBe(0.75);
  });

  it('should fill the gauge at the largest index', () => {
    expect(gaugeFraction(MAX_DANGER_LEVEL)).toBe(1);
  });

  it('should leave the gauge empty without a known index', () => {
    expect(gaugeFraction(null)).toBe(0);
    expect(gaugeFraction(0)).toBe(0);
  });
});
