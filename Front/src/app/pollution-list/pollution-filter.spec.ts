import { matches, PollutionFilter } from './pollution-filter';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';

describe('matches', () => {
  const POLLUTION: Pollution = {
    id: 1,
    label: 'Bouteilles',
    type: POLLUTION_TYPES[0],
    description: 'Sous le pont',
    date: '2026-09-12T09:30',
    place: 'Paris',
    latitude: '48.85',
    longitude: '2.34',
    image: '',
  };
  const EMPTY: PollutionFilter = { text: '', typeId: null, from: '', to: '' };

  it('should match everything with an empty filter', () => {
    expect(matches(POLLUTION, EMPTY)).toBe(true);
  });

  it('should search text case-insensitively in label, place and description', () => {
    expect(matches(POLLUTION, { ...EMPTY, text: 'PONT' })).toBe(true);
    expect(matches(POLLUTION, { ...EMPTY, text: 'paris' })).toBe(true);
    expect(matches(POLLUTION, { ...EMPTY, text: 'lyon' })).toBe(false);
  });

  it('should filter by type', () => {
    expect(matches(POLLUTION, { ...EMPTY, typeId: POLLUTION_TYPES[0].id })).toBe(true);
    expect(matches(POLLUTION, { ...EMPTY, typeId: POLLUTION_TYPES[1].id })).toBe(false);
  });

  it('should filter by inclusive date range', () => {
    expect(matches(POLLUTION, { ...EMPTY, from: '2026-09-12', to: '2026-09-12' })).toBe(true);
    expect(matches(POLLUTION, { ...EMPTY, from: '2026-09-13' })).toBe(false);
    expect(matches(POLLUTION, { ...EMPTY, to: '2026-09-11' })).toBe(false);
  });
});
