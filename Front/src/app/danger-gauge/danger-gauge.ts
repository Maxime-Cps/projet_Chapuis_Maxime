import { afterNextRender, Component, computed, input, signal } from '@angular/core';
import { gaugeFraction, LEVEL_TOKENS, toPollutionLevel } from '../../utils/pollution-level';
import { PollutionLevel } from '../../interfaces/PollutionLevel';
import { CountUp } from '../count-up/count-up';

/** Gauge boundaries between levels, as a share of the arc. */
const LEVEL_TICKS = [0.25, 0.5, 0.75];

/** Half circle of radius 50 centered on (60, 60), from left to right. */
const ARC = 'M 10 60 A 50 50 0 0 1 110 60';

/**
 * Half-circle gauge of a danger index, filling up to its level when shown.
 *
 *        ▁▂▃▄▅▆▇      arc filled in the level color
 *      ╱    80    ╲   index, counting up
 *          Élevée     level
 *
 * @example <app-danger-gauge [dangerLevel]="80" />
 */
@Component({
  imports: [CountUp],
  selector: 'app-danger-gauge',
  host: { role: 'img', '[attr.aria-label]': 'label()' },
  styleUrl: './danger-gauge.scss',
  template: `
    <svg viewBox="0 0 120 68" aria-hidden="true">
      <path class="track" [attr.d]="arc" pathLength="1" />
      <path
        class="fill"
        [attr.d]="arc"
        pathLength="1"
        [style.stroke]="color()"
        [style.stroke-dashoffset]="drawn() ? 1 - fraction() : 1"
      />
      @for (tick of ticks; track tick) {
        <line class="tick" x1="60" y1="16" x2="60" y2="4" [attr.transform]="'rotate(' + (tick * 180 - 90) + ' 60 60)'" />
      }
    </svg>
    <p class="reading">
      @if (dangerLevel() === null) {
        <span class="index">?</span>
      } @else {
        <app-count-up class="index" [value]="dangerLevel()!" />
      }
      <span class="level">{{ level() }}</span>
    </p>
  `,
})
export class DangerGauge {
  readonly dangerLevel = input.required<number | null>();

  protected readonly arc = ARC;
  protected readonly ticks = LEVEL_TICKS;
  protected readonly level = computed(() => toPollutionLevel(this.dangerLevel()));
  protected readonly fraction = computed(() => gaugeFraction(this.dangerLevel()));
  protected readonly color = computed(() => `var(${LEVEL_TOKENS[this.level()]})`);
  protected readonly label = computed(() =>
    this.level() === PollutionLevel.Unknown
      ? `Dangerosité : ${this.level()}`
      : `Dangerosité : ${this.level()}, indice ${this.dangerLevel()}`,
  );

  /** False on the first frame, so the arc fills from empty. */
  protected readonly drawn = signal(false);

  constructor() {
    afterNextRender(() => requestAnimationFrame(() => this.drawn.set(true)));
  }
}
