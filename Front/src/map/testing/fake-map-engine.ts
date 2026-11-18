import { Provider } from '@angular/core';
import { CityMap, CityMapOptions } from '../city-map';
import { MapEngine } from '../map-engine';

/** A {@link CityMap} whose methods are spies, with the options it was created with. */
export interface FakeCityMap extends CityMap {
  options: CityMapOptions;
}

/**
 * Replaces {@link MapEngine} in unit tests, where WebGL is missing.
 * `maps` collects every map created, so tests can fire callbacks and inspect calls.
 */
export function provideFakeMapEngine(maps: FakeCityMap[] = []): Provider {
  const engine: Pick<MapEngine, 'create'> = {
    create: async (options) => {
      const map: FakeCityMap = {
        options,
        setPoints: vi.fn(),
        highlight: vi.fn(),
        setView: vi.fn(),
        setBeacon: vi.fn(),
        fit: vi.fn(),
        setPin: vi.fn(),
        setPadding: vi.fn(),
        setPinMode: vi.fn(),
        centerOn: vi.fn(),
        destroy: vi.fn(),
      };
      maps.push(map);
      return map;
    },
  };

  return { provide: MapEngine, useValue: engine };
}
