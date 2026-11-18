import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { PollutionApi } from '../../services/pollution-api';
import { ListViewPreference } from '../../services/list-view-preference';
import { ListView } from '../../interfaces/ListView';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';
import { matches, PollutionFilter } from './pollution-filter';
import { LINKS } from '../../constants/routes';
import { POLLUTION_ERRORS } from '../../constants/messages';
import { Icon } from '../icon/icon';
import { SignOut } from '../sign-out/sign-out';
import { PollutionLevelPipe } from '../../pipes/pollution-level-pipe';
import { HighlightPollutionDirective } from '../../directives/highlight-pollution-directive';
import { PollutionMap } from '../pollution-map/pollution-map';
import { PollutionDeletion } from '../../services/pollution-deletion';
import { DateRange, DateTimeline } from '../date-timeline/date-timeline';
import { CountUp } from '../count-up/count-up';
import { reportTransition } from '../../utils/view-transition';

/** Rows drawn while the list loads. */
const SKELETON_ROWS = 4;

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    Icon,
    SignOut,
    PollutionLevelPipe,
    HighlightPollutionDirective,
    PollutionMap,
    DateTimeline,
    CountUp,
  ],
  selector: 'app-pollution-list',
  styleUrl: './pollution-list.scss',
  templateUrl: './pollution-list.html',
})
export class PollutionList {
  private readonly api = inject(PollutionApi);
  private readonly viewPreference = inject(ListViewPreference);
  private readonly router = inject(Router);
  private readonly deletion = inject(PollutionDeletion);

  readonly links = LINKS;
  readonly transitionName = reportTransition;
  readonly skeletonRows = Array.from({ length: SKELETON_ROWS }, (_, row) => row);
  readonly types = POLLUTION_TYPES;
  readonly views = ListView;
  readonly view = this.viewPreference.view;
  readonly pollutions = signal<Pollution[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  /** Ids of the pollutions whose image failed to load, shown with the placeholder instead. */
  readonly brokenImageIds = signal<ReadonlySet<number>>(new Set());

  /** Id of the report hovered or focused, in the list or on the map. */
  readonly highlightedId = signal<number | null>(null);

  readonly filterForm = new FormGroup({
    text: new FormControl('', { nonNullable: true }),
    typeId: new FormControl<number | null>(null),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
  });

  protected readonly filter = toSignal(
    this.filterForm.valueChanges.pipe(map((): PollutionFilter => this.filterForm.getRawValue())),
    { initialValue: this.filterForm.getRawValue() },
  );

  /** Pollutions not being deleted. */
  readonly available = computed(() => {
    const hidden = this.deletion.hiddenIds();
    return this.pollutions().filter((p) => !hidden.has(p.id));
  });

  readonly visible = computed(() => this.available().filter((p) => matches(p, this.filter())));

  /** Changes with the filters and the loaded reports, not with deletions: the map keeps its view. */
  readonly frameKey = computed(() => `${JSON.stringify(this.filter())}|${this.pollutions().length}`);

  /** Dates spanning the timeline, and those counted in its bars: every filter but the period. */
  readonly allDates = computed(() => this.available().map((p) => p.date));
  readonly timelineDates = computed(() => {
    const filter = { ...this.filter(), from: '', to: '' };
    return this.available()
      .filter((p) => matches(p, filter))
      .map((p) => p.date);
  });

  constructor() {
    this.api.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (pollutions) => this.pollutions.set(pollutions),
      error: () => this.error.set(POLLUTION_ERRORS.listLoad),
    });
  }

  /** Hides the pollution, then deletes it unless undone within a few seconds. */
  remove(pollution: Pollution) {
    this.deletion.schedule(pollution);
  }

  setPeriod(range: DateRange) {
    this.filterForm.patchValue(range);
  }

  setView(view: ListView) {
    this.viewPreference.set(view);
  }

  markImageBroken(id: number) {
    this.brokenImageIds.update((ids) => new Set(ids).add(id));
  }

  resetFilters() {
    this.filterForm.reset();
  }

  openDetail(id: number) {
    this.router.navigateByUrl(LINKS.detail(id));
  }
}
