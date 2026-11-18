import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { easeOutCubic, prefersReducedMotion } from '../../utils/motion';

/** Duration of a count, in ms. */
const COUNT_MS = 600;

/**
 * Whole number that counts up (or down) to its new value. Decorative: the parent states
 * the value to assistive technologies, which would otherwise hear every step.
 *
 * @example <app-count-up [value]="visible().length" />
 */
@Component({
  selector: 'app-count-up',
  host: { 'aria-hidden': 'true' },
  template: `{{ shown() }}`,
})
export class CountUp {
  readonly value = input.required<number>();

  protected readonly shown = signal(0);
  private frame = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));

    effect(() => {
      const target = this.value();
      const start = untracked(this.shown);
      cancelAnimationFrame(this.frame);

      if (prefersReducedMotion() || start === target) {
        this.shown.set(target);
        return;
      }

      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / COUNT_MS);
        this.shown.set(Math.round(start + (target - start) * easeOutCubic(progress)));
        if (progress < 1) {
          this.frame = requestAnimationFrame(step);
        }
      };
      this.frame = requestAnimationFrame(step);
    });
  }
}
