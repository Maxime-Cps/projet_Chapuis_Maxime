import { afterNextRender, DestroyRef, inject, PendingTasks, Signal, signal } from '@angular/core';
import { CityMap, CityMapOptions } from './city-map';
import { MapEngine } from './map-engine';

/** A map owned by a component: null until drawn, `unavailable` when it cannot be. */
export interface CityMapRef {
  map: Signal<CityMap | null>;
  unavailable: Signal<boolean>;
}

/**
 * Draws a map once the component is rendered and frees it when the component is destroyed.
 * Call it from a constructor or a field initializer.
 *
 * @example readonly cityMap = injectCityMap(() => ({ container: this.surface().nativeElement, ... }));
 */
export function injectCityMap(options: () => CityMapOptions): CityMapRef {
  const engine = inject(MapEngine);
  const destroyRef = inject(DestroyRef);
  const map = signal<CityMap | null>(null);
  const unavailable = signal(false);

  const pendingTasks = inject(PendingTasks);

  afterNextRender(() => {
    // A pending task keeps the app unstable until the map is drawn, e.g. for `fixture.whenStable()`
    pendingTasks.run(async () => {
      const created = await engine.create(options()).catch(() => null);
      if (destroyRef.destroyed) {
        created?.destroy();
        return;
      }

      map.set(created);
      unavailable.set(created === null);
    });
  });

  destroyRef.onDestroy(() => map()?.destroy());

  return { map: map.asReadonly(), unavailable: unavailable.asReadonly() };
}
