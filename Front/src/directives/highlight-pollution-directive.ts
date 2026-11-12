import { computed, Directive, input } from '@angular/core';
import { PollutionLevel } from '../interfaces/PollutionLevel';
import { toPollutionLevel } from '../utils/pollution-level';

/** Background of each level, from the design tokens. */
const LEVEL_COLORS: Record<PollutionLevel, string> = {
  [PollutionLevel.Low]: 'var(--level-low)',
  [PollutionLevel.Moderate]: 'var(--level-moderate)',
  [PollutionLevel.High]: 'var(--level-high)',
  [PollutionLevel.Dangerous]: 'var(--level-dangerous)',
  [PollutionLevel.Unknown]: 'var(--muted)',
};

/** Colors the host background by danger index, e.g. `<span [appHighlightPollution]="80">` -> orange. */
@Directive({
  selector: '[appHighlightPollution]',
  host: { '[style.background-color]': 'color()' },
})
export class HighlightPollutionDirective {
  /** Danger index of the pollution. */
  readonly appHighlightPollution = input.required<number | null | undefined>();

  protected readonly color = computed(() => LEVEL_COLORS[toPollutionLevel(this.appHighlightPollution())]);
}
