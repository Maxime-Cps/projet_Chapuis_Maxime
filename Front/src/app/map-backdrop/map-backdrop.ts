import { Component } from '@angular/core';

/**
 * Decorative city map drawn behind the form.
 * Purely visual: hidden from assistive technologies.
 */
@Component({
  selector: 'app-map-backdrop',
  host: { 'aria-hidden': 'true' },
  styleUrl: './map-backdrop.scss',
  template: `
    <svg viewBox="0 0 1280 900" preserveAspectRatio="xMidYMid slice">
      <rect class="land" width="1280" height="900" />
      <path class="park" d="M60 80 L380 50 L420 260 L90 300 Z" />
      <path class="park" d="M760 620 L1100 580 L1120 860 L790 900 Z" />
      <path class="water" d="M-60 700 C 200 640, 360 560, 480 440 S 700 200, 820 120 S 1100 0, 1340 -40" />
      <path class="road" stroke-width="14" d="M0 470 L1280 410" />
      <path class="road" stroke-width="12" d="M300 0 L360 900" />
      <path class="road" stroke-width="10" d="M700 0 L640 900" />
      <path class="street" d="M0 240 L1280 280" />
      <path class="street" d="M0 760 L1280 700" />
      <path class="street" d="M520 0 L540 900" />
      <path class="street" d="M980 0 L1020 900" />
      <g class="building">
        <rect x="380" y="500" width="90" height="50" />
        <rect x="380" y="560" width="50" height="70" />
        <rect x="760" y="300" width="70" height="80" />
        <rect x="80" y="520" width="150" height="70" />
        <rect x="560" y="120" width="100" height="60" />
      </g>
    </svg>
  `,
})
export class MapBackdrop {}
