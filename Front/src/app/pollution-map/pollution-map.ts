import { Component, computed, effect, ElementRef, input, model, output, viewChild } from '@angular/core';
import { Pollution } from '../../interfaces/Pollution';
import { injectCityMap } from '../../map/inject-city-map';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_UNAVAILABLE } from '../../constants/map';
import { toMapPoints } from './map-points';

/**
 * Map of pollution reports, one dot per report colored by level.
 * Frames the reports whenever the set changes.
 *
 * @example <app-pollution-map [pollutions]="visible()" [(highlighted)]="hoveredId" (selected)="open($event)" />
 */
@Component({
  selector: 'app-pollution-map',
  host: { role: 'region', 'aria-label': 'Carte des signalements' },
  styleUrl: './pollution-map.scss',
  template: `
    <div #surface class="surface"></div>
    @if (cityMap.unavailable()) {
      <p class="notice">{{ unavailableText }}</p>
    }
  `,
})
export class PollutionMap {
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');

  /** Ids of the reports last framed, to reframe only when the set changes. */
  private framedIds = '';

  readonly pollutions = input.required<readonly Pollution[]>();

  /** Id of the report put forward, shared with the list. */
  readonly highlighted = model<number | null>(null);

  /** Emits the id of a clicked report. */
  readonly selected = output<number>();

  protected readonly unavailableText = MAP_UNAVAILABLE;
  private readonly points = computed(() => toMapPoints(this.pollutions()));

  protected readonly cityMap = injectCityMap(() => ({
    container: this.surface().nativeElement,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    onPointHover: (id) => this.highlighted.set(id),
    onPointClick: (id) => this.selected.emit(id),
  }));

  constructor() {
    effect(() => {
      const map = this.cityMap.map();
      if (!map) {
        return;
      }

      const points = this.points();
      map.setPoints(points);

      const ids = points.map((point) => point.id).join();
      if (ids === this.framedIds) {
        return;
      }

      this.framedIds = ids;
      map.fit(points.map((point) => point.position));
    });

    effect(() => this.cityMap.map()?.highlight(this.highlighted()));
  }
}
