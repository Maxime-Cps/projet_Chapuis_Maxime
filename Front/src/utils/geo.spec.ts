import { roundPosition, toGeoPosition } from './geo';

describe('toGeoPosition', () => {
  it('should read coordinates stored as strings', () => {
    expect(toGeoPosition('48.85', '2.34')).toEqual({ latitude: 48.85, longitude: 2.34 });
  });

  it('should keep a zero coordinate', () => {
    expect(toGeoPosition(0, 0)).toEqual({ latitude: 0, longitude: 0 });
  });

  it.each([
    ['', 2.34],
    [null, 2.34],
    [48.85, undefined],
    ['abc', 2.34],
    [91, 2.34],
    [48.85, -181],
  ])('should reject %s, %s', (latitude, longitude) => {
    expect(toGeoPosition(latitude, longitude)).toBeNull();
  });
});

describe('roundPosition', () => {
  it('should keep 6 decimals', () => {
    expect(roundPosition({ latitude: 48.856613456, longitude: 2.352221999 })).toEqual({
      latitude: 48.856613,
      longitude: 2.352222,
    });
  });
});
