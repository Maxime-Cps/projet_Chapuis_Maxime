import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { bucketIndex, buildHistogram, DayBucket } from './histogram';

/** Most bars drawn, whatever the span of dates. */
const MAX_BARS = 40;

/** Smallest visible bar, for spans with reports, as a share of the tallest. */
const MIN_BAR = 4;

/** Which end of the period a slider moves. */
enum Edge {
  Start = 'start',
  End = 'end',
}

/** A period of days, `yyyy-MM-dd`; an empty end is open. */
export interface DateRange {
  from: string;
  to: string;
}

/**
 * Histogram of reports over time with two sliders to pick a period.
 * Bars in the period are amber. Sliders at both ends leave the period open.
 *
 *     ▂ ▅ █ ▃ ▁ ▆ ▂
 *     ●━━━━━━━━━●       start and end sliders
 *   12/01      28/03
 *
 * @example <app-date-timeline [dates]="all" [counted]="matching" [from]="from" [to]="to" (rangeChange)="set($event)" />
 */
@Component({
  imports: [DatePipe],
  selector: 'app-date-timeline',
  styleUrl: './date-timeline.scss',
  template: `
    @if (buckets().length > 1) {
      <div class="chart">
        <div class="bars" aria-hidden="true">
          @for (bucket of buckets(); track bucket.from; let i = $index) {
            <span
              class="bar"
              [class.in-range]="i >= start() && i <= end()"
              [style.height.%]="barHeight(bucket)"
            ></span>
          }
        </div>

        <input
          type="range"
          min="0"
          [max]="lastIndex()"
          [value]="start()"
          [class.raised]="startRaised()"
          aria-label="Début de la période"
          [attr.aria-valuetext]="buckets()[start()].from | date: 'dd/MM/yyyy'"
          (input)="move(edges.Start, $event)"
        />
        <input
          type="range"
          min="0"
          [max]="lastIndex()"
          [value]="end()"
          aria-label="Fin de la période"
          [attr.aria-valuetext]="buckets()[end()].to | date: 'dd/MM/yyyy'"
          (input)="move(edges.End, $event)"
        />
      </div>

      <p class="period" aria-hidden="true">
        <span>{{ buckets()[start()].from | date: 'dd/MM/yyyy' }}</span>
        <span>{{ buckets()[end()].to | date: 'dd/MM/yyyy' }}</span>
      </p>
    }
  `,
})
export class DateTimeline {
  /** Dates setting the span of the axis, e.g. of every report. */
  readonly dates = input.required<readonly string[]>();

  /** Dates counted in the bars, e.g. of the reports matching the other filters. */
  readonly counted = input.required<readonly string[]>();

  readonly from = input('');
  readonly to = input('');

  /** Emits the period picked with the sliders. */
  readonly rangeChange = output<DateRange>();

  protected readonly edges = Edge;
  protected readonly buckets = computed(() => buildHistogram(this.dates(), this.counted(), MAX_BARS));
  protected readonly lastIndex = computed(() => this.buckets().length - 1);
  protected readonly start = computed(() => bucketIndex(this.buckets(), this.from(), 0));
  protected readonly end = computed(() =>
    Math.max(this.start(), bucketIndex(this.buckets(), this.to(), this.lastIndex())),
  );
  /**
   * Whether the start thumb sits above the end one. Both on one stop, only the upper thumb can be
   * grabbed, and each can move one way: the start goes left, the end goes right. Raising the one
   * with more room keeps the period widenable.
   */
  protected readonly startRaised = computed(
    () => this.start() === this.end() && this.start() > this.lastIndex() / 2,
  );

  private readonly tallest = computed(() => Math.max(1, ...this.buckets().map((bucket) => bucket.count)));

  protected barHeight(bucket: DayBucket): number {
    if (bucket.count === 0) {
      return 0;
    }

    return Math.max(MIN_BAR, (bucket.count / this.tallest()) * 100);
  }

  protected move(edge: Edge, event: Event) {
    const slider = event.target as HTMLInputElement;
    const value = Number(slider.value);
    const start = edge === Edge.Start ? Math.min(value, this.end()) : this.start();
    const end = edge === Edge.End ? Math.max(value, this.start()) : this.end();

    // The sliders may not cross: put a slider pushed past the other back on it
    slider.value = String(edge === Edge.Start ? start : end);

    const buckets = this.buckets();
    this.rangeChange.emit({
      from: start === 0 ? '' : buckets[start].from,
      to: end === this.lastIndex() ? '' : buckets[end].to,
    });
  }
}
