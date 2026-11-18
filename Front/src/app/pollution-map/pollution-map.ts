import { Component, computed, effect, ElementRef, input, model, output, signal, viewChild } from '@angular/core';
import { Pollution } from '../../interfaces/Pollution';
import { injectCityMap } from '../../map/inject-city-map';
import { DEFAULT_CENTER, DEFAULT_ZOOM, LIST_PITCH, MAP_UNAVAILABLE } from '../../constants/map';
import { toMapPoints } from './map-points';
import { MapView } from '../../map/city-map';
import { Icon } from '../icon/icon';

/**
 * Map of pollution reports, one dot per report colored by level.
 * Frames the reports whenever the set changes.
 *
 * @example <app-pollution-map [pollutions]="visible()" [(highlighted)]="hoveredId" (selected)="open($event)" />
 */
@Component({
  imports: [Icon],
  selector: 'app-pollution-map',
  host: { role: 'region', 'aria-label': 'Carte des signalements' },
  styleUrl: './pollution-map.scss',
  template: `
    <div #surface class="surface"></div>
    @if (cityMap.unavailable()) {
      <p class="notice">{{ unavailableText }}</p>
    } @else {
      <div class="view-switch" role="group" aria-label="Affichage de la carte">
        <button
          type="button"
          class="icon-btn"
          aria-label="Repères"
          title="Repères"
          [attr.aria-pressed]="view() === views.Points"
          (click)="view.set(views.Points)"
        >
          <app-icon name="map-pin" />
        </button>
        <button
          type="button"
          class="icon-btn"
          aria-label="Carte de chaleur"
          title="Carte de chaleur"
          [attr.aria-pressed]="view() === views.Heat"
          (click)="view.set(views.Heat)"
        >
          <app-icon name="flame" />
        </button>
      </div>
    }
  `,
})
export class PollutionMap {
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');

  /** Key of the last framing, to reframe only when it changes. */
  private framedKey = '';

  readonly pollutions = input.required<readonly Pollution[]>();

  /**
   * Reframes the reports when it changes, e.g. the filters; without it, any change of the set does.
   * Lets a report leave the set (e.g. deleted) without moving the camera.
   */
  readonly frameKey = input<string | null>(null);

  /** Id of the report put forward, shared with the list. */
  readonly highlighted = model<number | null>(null);

  /** Emits the id of a clicked report. */
  readonly selected = output<number>();

  protected readonly unavailableText = MAP_UNAVAILABLE;
  protected readonly views = MapView;

  /** Dots one by one, or a heat map of danger. */
  protected readonly view = signal(MapView.Points);
  private readonly points = computed(() => toMapPoints(this.pollutions()));

  protected readonly cityMap = injectCityMap(() => ({
    container: this.surface().nativeElement,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    pitch: LIST_PITCH,
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

      const key = this.frameKey() ?? points.map((point) => point.id).join();
      if (key === this.framedKey) {
        return;
      }

      this.framedKey = key;
      map.fit(points.map((point) => point.position));
    });

    effect(() => this.cityMap.map()?.highlight(this.highlighted()));
    effect(() => this.cityMap.map()?.setView(this.view()));
  }
}
