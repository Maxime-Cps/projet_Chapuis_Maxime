import { ParticleKind } from '../../map/city-map';
import { MAX_DANGER_LEVEL } from '../../utils/pollution-level';
import { beaconHeight, particlesOf, toBeacon } from './beacon';

describe('beaconHeight', () => {
  it('should grow with the order of magnitude of the index', () => {
    expect(beaconHeight(0)).toBe(30);
    expect(beaconHeight(9)).toBeCloseTo(60);
    expect(beaconHeight(99)).toBeCloseTo(90);
  });

  it('should cap the height of huge indexes', () => {
    expect(beaconHeight(MAX_DANGER_LEVEL)).toBe(220);
  });

  it('should keep a short column for an unknown index', () => {
    expect(beaconHeight(null)).toBe(25);
    expect(beaconHeight(Number.NaN)).toBe(25);
  });
});

describe('particlesOf', () => {
  it('should match particles to the pollution type', () => {
    expect(particlesOf(0)).toBe(ParticleKind.Fragments);
    expect(particlesOf(1)).toBe(ParticleKind.Smoke);
    expect(particlesOf(3)).toBe(ParticleKind.Drops);
    expect(particlesOf(4)).toBe(ParticleKind.Smoke);
  });

  it('should give no particles to other or missing types', () => {
    expect(particlesOf(5)).toBe(ParticleKind.None);
    expect(particlesOf(null)).toBe(ParticleKind.None);
  });
});

describe('toBeacon', () => {
  it('should color the column by level', () => {
    const position = { latitude: 48.85, longitude: 2.34 };

    expect(toBeacon(position, 3, 80)).toEqual({
      position,
      height: beaconHeight(80),
      colorToken: '--level-high',
      particles: ParticleKind.Drops,
    });
  });
});
