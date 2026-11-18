import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';
import { toMapPoints } from './map-points';

describe('toMapPoints', () => {
  const BASE: Pollution = {
    id: 1,
    label: 'Bouteilles',
    type: POLLUTION_TYPES[0],
    description: '',
    date: '2026-09-12T09:30',
    place: 'Paris',
    latitude: '48.85',
    longitude: '2.34',
    image: '',
    dangerLevel: 80,
  };

  it('should place a pollution at its coordinates, colored by level', () => {
    expect(toMapPoints([BASE])).toEqual([
      { id: 1, position: { latitude: 48.85, longitude: 2.34 }, colorToken: '--level-high', severity: 3 },
    ]);
  });

  it('should use the muted color for an unknown level', () => {
    const [point] = toMapPoints([{ ...BASE, dangerLevel: null }]);

    expect(point.colorToken).toBe('--muted');
    expect(point.severity).toBe(0);
  });

  it('should leave out pollutions without valid coordinates', () => {
    const points = toMapPoints([BASE, { ...BASE, id: 2, latitude: '' }, { ...BASE, id: 3, longitude: 'x' }]);

    expect(points.map((point) => point.id)).toEqual([1]);
  });
});
