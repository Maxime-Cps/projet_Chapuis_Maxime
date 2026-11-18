import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Pollution } from '../../interfaces/Pollution';
import { injectCityMap } from '../../map/inject-city-map';
import { keepClearOf } from '../../map/keep-clear-of';
import { toGeoPosition } from '../../utils/geo';
import { DEFAULT_CENTER, SCENE_CAMERA } from '../../constants/map';
import { toBeacon } from '../pollution-map/beacon';
import { MapBackdrop } from '../map-backdrop/map-backdrop';

/**
 * Report seen in 3D on the city: buildings in relief and a column dropped at its position,
 * as high as it is dangerous, giving off particles by type. The illustration stands in where
 * the map cannot be drawn.
 *
 * @example <app-pollution-scene [pollution]="pollution" [overlay]="panel" />
 */
@Component({
  imports: [MapBackdrop],
  selector: 'app-pollution-scene',
  host: { role: 'region', '[attr.aria-label]': 'label()' },
  styleUrl: './pollution-scene.scss',
  template: `
    <div #surface class="surface"></div>
    @if (cityMap.unavailable()) {
      <app-map-backdrop />
    }
  `,
})
export class PollutionScene {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');

  readonly pollution = input.required<Pollution>();

  /** Element drawn over the scene, e.g. the detail panel: the column stays clear of it. */
  readonly overlay = input<HTMLElement | null>(null);

  private readonly position = computed(() => toGeoPosition(this.pollution().latitude, this.pollution().longitude));
  protected readonly label = computed(() => `Vue 3D du lieu : ${this.pollution().place}`);

  protected readonly cityMap = injectCityMap(() => ({
    container: this.surface().nativeElement,
    center: this.position() ?? DEFAULT_CENTER,
    ...SCENE_CAMERA,
  }));

  constructor() {
    // Before the beacon effect, so centering on it already avoids the overlay
    effect((onCleanup) => {
      const map = this.cityMap.map();
      const overlay = this.overlay();
      if (!map || !overlay) {
        return;
      }

      onCleanup(keepClearOf(map, this.host.nativeElement, overlay));
    });

    effect(() => {
      const map = this.cityMap.map();
      const position = this.position();
      if (!map || !position) {
        return;
      }

      const { type, dangerLevel } = this.pollution();
      map.setBeacon(toBeacon(position, type.id, dangerLevel));
    });
  }
}
