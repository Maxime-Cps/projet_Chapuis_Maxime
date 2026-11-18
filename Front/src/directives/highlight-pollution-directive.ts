import { computed, Directive, input } from '@angular/core';
import { LEVEL_TOKENS, toPollutionLevel } from '../utils/pollution-level';

/** Colors the host background by danger index, e.g. `<span [appHighlightPollution]="80">` -> orange. */
@Directive({
  selector: '[appHighlightPollution]',
  host: { '[style.background-color]': 'color()' },
})
export class HighlightPollutionDirective {
  /** Danger index of the pollution. */
  readonly appHighlightPollution = input.required<number | null | undefined>();

  protected readonly color = computed(
    () => `var(${LEVEL_TOKENS[toPollutionLevel(this.appHighlightPollution())]})`,
  );
}
