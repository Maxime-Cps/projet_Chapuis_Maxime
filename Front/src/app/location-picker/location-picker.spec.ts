import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocationPicker } from './location-picker';
import { GeoPosition } from '../../interfaces/GeoPosition';
import { FakeCityMap, provideFakeMapEngine } from '../../map/testing/fake-map-engine';
import { MapEngine } from '../../map/map-engine';
import { DEFAULT_CENTER, MAP_UNAVAILABLE, STREET_ZOOM } from '../../constants/map';
import { PinMode } from '../../map/city-map';

@Component({
  imports: [LocationPicker],
  template: `<app-location-picker [(position)]="position" [pinMode]="pinMode()" place="Quai de la Loire" />`,
})
class Host {
  readonly position = signal<GeoPosition | null>(null);
  readonly pinMode = signal(PinMode.Movable);
}

describe('LocationPicker', () => {
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

  it('should open on the default view and invite to place the pin', async () => {
    const { fixture, map } = await render();

    expect(map.options.center).toEqual(DEFAULT_CENTER);
    expect(map.setPin).toHaveBeenLastCalledWith(null);
    expect(fixture.nativeElement.textContent).toContain('Cliquez sur la carte');
  });

  it('should place the pin where the map is clicked, rounded to 6 decimals', async () => {
    const { fixture, host, map } = await render();

    map.options.onMapClick!({ latitude: 48.886712345, longitude: 2.375612345 });
    await fixture.whenStable();

    expect(host.position()).toEqual({ latitude: 48.886712, longitude: 2.375612 });
    expect(map.setPin).toHaveBeenLastCalledWith({ latitude: 48.886712, longitude: 2.375612 });
  });

  it('should take the position where the pin is dropped', async () => {
    const { fixture, host, map } = await render();

    map.options.onPinMove!({ latitude: 45.76, longitude: 4.83 });
    await fixture.whenStable();

    expect(host.position()).toEqual({ latitude: 45.76, longitude: 4.83 });
  });

  it('should move the pin to typed coordinates', async () => {
    const { fixture, host, map } = await render();

    host.position.set({ latitude: 43.3, longitude: 5.37 });
    await fixture.whenStable();

    expect(map.setPin).toHaveBeenLastCalledWith({ latitude: 43.3, longitude: 5.37 });
  });

  it('should zoom to street level on a position given from outside', async () => {
    const { fixture, host, map } = await render();

    host.position.set({ latitude: 43.3, longitude: 5.37 });
    await fixture.whenStable();

    expect(map.centerOn).toHaveBeenCalledWith({ latitude: 43.3, longitude: 5.37 }, STREET_ZOOM);
  });

  it('should keep the zoom when the pin is placed on the map', async () => {
    const { fixture, map } = await render();

    map.options.onMapClick!({ latitude: 45.76, longitude: 4.83 });
    await fixture.whenStable();

    expect(map.centerOn).not.toHaveBeenCalled();
  });

  it('should ignore clicks while the pin is fixed', async () => {
    const { fixture, host, map } = await render();

    host.pinMode.set(PinMode.Fixed);
    await fixture.whenStable();
    map.options.onMapClick!({ latitude: 45.76, longitude: 4.83 });
    map.options.onPinMove!({ latitude: 45.76, longitude: 4.83 });
    await fixture.whenStable();

    expect(map.setPinMode).toHaveBeenLastCalledWith(PinMode.Fixed);
    expect(host.position()).toBeNull();
  });

  it('should say so when the map cannot be drawn', async () => {
    TestBed.overrideProvider(MapEngine, { useValue: { create: async () => null } });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(MAP_UNAVAILABLE);
  });
});
