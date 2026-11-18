import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PollutionMap } from './pollution-map';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';
import { FakeCityMap, provideFakeMapEngine } from '../../map/testing/fake-map-engine';

const PARIS: Pollution = {
  id: 1,
  label: 'Bouteilles',
  type: POLLUTION_TYPES[0],
  description: '',
  date: '2026-09-12T09:30',
  place: 'Paris',
  latitude: '48.85',
  longitude: '2.34',
  image: '',
  dangerLevel: 10,
};
const LYON: Pollution = { ...PARIS, id: 2, latitude: '45.76', longitude: '4.83' };

@Component({
  imports: [PollutionMap],
  template: `
    <app-pollution-map
      [pollutions]="pollutions()"
      [frameKey]="frameKey()"
      [(highlighted)]="highlighted"
      (selected)="selected.set($event)"
    />
  `,
})
class Host {
  readonly pollutions = signal<Pollution[]>([PARIS, LYON]);
  readonly frameKey = signal<string | null>(null);
  readonly highlighted = signal<number | null>(null);
  readonly selected = signal<number | null>(null);
}

describe('PollutionMap', () => {
  let maps: FakeCityMap[];

  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance, map: maps[0] };
  }

  beforeEach(() => {
    maps = [];
    TestBed.configureTestingModule({ providers: [provideFakeMapEngine(maps)] });
  });

  it('should draw one dot per pollution and frame them', async () => {
    const { map } = await render();

    expect(map.setPoints).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
    ]);
    expect(map.fit).toHaveBeenCalledWith([
      { latitude: 48.85, longitude: 2.34 },
      { latitude: 45.76, longitude: 4.83 },
    ]);
  });

  it('should reframe only when the set of pollutions changes', async () => {
    const { fixture, host, map } = await render();

    host.pollutions.set([PARIS, LYON]);
    await fixture.whenStable();
    expect(map.fit).toHaveBeenCalledTimes(1);

    host.pollutions.set([PARIS]);
    await fixture.whenStable();
    expect(map.fit).toHaveBeenCalledTimes(2);
  });

  it('should reframe only when the frame key changes, when given', async () => {
    const { fixture, host, map } = await render();
    host.frameKey.set('filters-a');
    await fixture.whenStable();
    expect(map.fit).toHaveBeenCalledTimes(2);

    host.pollutions.set([PARIS]);
    await fixture.whenStable();
    expect(map.fit).toHaveBeenCalledTimes(2);

    host.frameKey.set('filters-b');
    await fixture.whenStable();
    expect(map.fit).toHaveBeenCalledTimes(3);
  });

  it('should put forward the dot highlighted from the list', async () => {
    const { fixture, host, map } = await render();

    host.highlighted.set(2);
    await fixture.whenStable();

    expect(map.highlight).toHaveBeenLastCalledWith(2);
  });

  it('should share the hovered dot and emit the clicked one', async () => {
    const { fixture, host, map } = await render();

    map.options.onPointHover!(1);
    map.options.onPointClick!(1);
    await fixture.whenStable();

    expect(host.highlighted()).toBe(1);
    expect(host.selected()).toBe(1);
  });

  it('should free the map with the component', async () => {
    const { fixture, map } = await render();

    fixture.destroy();

    expect(map.destroy).toHaveBeenCalled();
  });
});
