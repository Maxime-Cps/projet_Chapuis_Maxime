import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { PollutionApi } from '../../services/pollution-api';
import { ListViewPreference } from '../../services/list-view-preference';
import { ListView } from '../../interfaces/ListView';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';
import { matches, PollutionFilter } from './pollution-filter';
import { LINKS } from '../../constants/routes';
import { deleteConfirmation, POLLUTION_ERRORS } from '../../constants/messages';
import { Icon } from '../icon/icon';
import { SignOut } from '../sign-out/sign-out';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icon, SignOut],
  selector: 'app-pollution-list',
  styleUrl: './pollution-list.scss',
  templateUrl: './pollution-list.html',
})
export class PollutionList {
  private readonly api = inject(PollutionApi);
  private readonly viewPreference = inject(ListViewPreference);

  readonly links = LINKS;
  readonly types = POLLUTION_TYPES;
  readonly views = ListView;
  readonly view = this.viewPreference.view;
  readonly pollutions = signal<Pollution[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  /** Ids of the pollutions whose image failed to load, shown with the placeholder instead. */
  readonly brokenImageIds = signal<ReadonlySet<number>>(new Set());

  /** Ids of the pollutions being deleted, to disable their buttons meanwhile. */
  readonly deletingIds = signal<ReadonlySet<number>>(new Set());

  readonly filterForm = new FormGroup({
    text: new FormControl('', { nonNullable: true }),
    typeId: new FormControl<number | null>(null),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
  });

  private readonly filter = toSignal(
    this.filterForm.valueChanges.pipe(map((): PollutionFilter => this.filterForm.getRawValue())),
    { initialValue: this.filterForm.getRawValue() },
  );

  readonly visible = computed(() => this.pollutions().filter((p) => matches(p, this.filter())));

  constructor() {
    this.api.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (pollutions) => this.pollutions.set(pollutions),
      error: () => this.error.set(POLLUTION_ERRORS.listLoad),
    });
  }

  remove(pollution: Pollution) {
    if (!confirm(deleteConfirmation(pollution.label))) {
      return;
    }

    this.error.set(null);
    this.toggleDeleting(pollution.id);
    this.api.delete(pollution.id).pipe(finalize(() => this.toggleDeleting(pollution.id))).subscribe({
      next: () => this.pollutions.update((list) => list.filter((p) => p.id !== pollution.id)),
      error: () => this.error.set(POLLUTION_ERRORS.delete),
    });
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

  private toggleDeleting(id: number) {
    this.deletingIds.update((ids) => {
      const next = new Set(ids);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }
}
