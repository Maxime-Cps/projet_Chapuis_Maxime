import { Component, effect, ElementRef, inject, input, model, viewChild } from '@angular/core';
import { GeoPosition } from '../../interfaces/GeoPosition';
import { injectCityMap } from '../../map/inject-city-map';
import { roundPosition } from '../../utils/geo';
import { paddingBeside } from '../../map/map-padding';
import { PinMode } from '../../map/city-map';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_UNAVAILABLE, STREET_ZOOM } from '../../constants/map';

/**
 * Map to choose where a pollution was seen: a click places the pin, which can then be dragged.
 * The pin follows `position` when it changes from outside, e.g. typed coordinates.
 *
 * @example <app-location-picker [position]="position()" [overlay]="panel" (positionChange)="pick($event)" />
 */
@Component({
  selector: 'app-location-picker',
  host: { role: 'region', 'aria-label': "Carte du lieu de l'observation" },
  styleUrl: './location-picker.scss',
  template: `
    <div #surface class="surface"></div>

    <!-- Moved into the map by MapLibre once placed -->
    <div #pin class="pin" aria-hidden="true">
      <span class="pin-label">
        <span class="pin-place">{{ place() || placeholder }}</span>
        @if (position(); as position) {
          <span class="pin-coords">{{ position.latitude }} · {{ position.longitude }}</span>
        }
      </span>
    </div>

    @if (cityMap.unavailable()) {
      <p class="notice">{{ unavailableText }}</p>
    } @else if (!position()) {
      <p class="notice">Cliquez sur la carte pour placer le repère.</p>
    }
  `,
})
export class LocationPicker {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');
  private readonly pin = viewChild.required<ElementRef<HTMLElement>>('pin');

  /** Whether the pin is on the map, to zoom in only when a position first comes from outside. */
  private hasPin = false;

  /** Chosen position, rounded to 6 decimals; null until placed. */
  readonly position = model<GeoPosition | null>(null);

  /** Name of the place, shown next to the pin. */
  readonly place = input<string | null>('');

  /** Whether clicks and drags move the pin. */
  readonly pinMode = input(PinMode.Movable);

  /** Element drawn over the map, e.g. the form panel: centering keeps the pin clear of it. */
  readonly overlay = input<HTMLElement | null>(null);

  protected readonly placeholder = "Lieu de l'observation";
  protected readonly unavailableText = MAP_UNAVAILABLE;

  protected readonly cityMap = injectCityMap(() => {
    const position = this.position();
    return {
      container: this.surface().nativeElement,
      center: position ?? DEFAULT_CENTER,
      zoom: position ? STREET_ZOOM : DEFAULT_ZOOM,
      pin: this.pin().nativeElement,
      onMapClick: (picked) => this.pick(picked),
      onPinMove: (picked) => this.pick(picked),
    };
  });

  constructor() {
    // Before the pin effect, so the first recentering already avoids the overlay
    effect((onCleanup) => {
      const map = this.cityMap.map();
      const overlay = this.overlay();
      if (!map || !overlay) {
        return;
      }

      const update = () =>
        map.setPadding(
          paddingBeside(this.host.nativeElement.getBoundingClientRect(), overlay.getBoundingClientRect()),
        );
      update();

      const observer = new ResizeObserver(update);
      observer.observe(this.host.nativeElement);
      observer.observe(overlay);
      onCleanup(() => observer.disconnect());
    });

    effect(() => this.cityMap.map()?.setPinMode(this.pinMode()));

    effect(() => {
      const map = this.cityMap.map();
      if (!map) {
        return;
      }

      const position = this.position();
      map.setPin(position);
      if (position && !this.hasPin) {
        map.centerOn(position, STREET_ZOOM);
      }

      this.hasPin = position !== null;
    });
  }

  private pick(position: GeoPosition) {
    if (this.pinMode() === PinMode.Fixed) {
      return;
    }

    // Placed by the user: keep their zoom
    this.hasPin = true;
    this.position.set(roundPosition(position));
  }
}
