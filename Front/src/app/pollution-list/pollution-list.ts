import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';
import { matches, PollutionFilter } from './pollution-filter';
import { LINKS } from '../../constants/routes';
import { deleteConfirmation, POLLUTION_ERRORS } from '../../constants/messages';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  selector: 'app-pollution-list',
  styleUrl: './pollution-list.scss',
  templateUrl: './pollution-list.html',
})
export class PollutionList {
  private readonly api = inject(PollutionApi);

  readonly links = LINKS;
  readonly types = POLLUTION_TYPES;
  readonly pollutions = signal<Pollution[]>([]);
  readonly error = signal<string | null>(null);

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
    this.api.getAll().subscribe({
      next: (pollutions) => this.pollutions.set(pollutions),
      error: () => this.error.set(POLLUTION_ERRORS.listLoad),
    });
  }

  remove(pollution: Pollution) {
    if (!confirm(deleteConfirmation(pollution.label))) {
      return;
    }

    this.error.set(null);
    this.api.delete(pollution.id).subscribe({
      next: () => this.pollutions.update((list) => list.filter((p) => p.id !== pollution.id)),
      error: () => this.error.set(POLLUTION_ERRORS.delete),
    });
  }

  resetFilters() {
    this.filterForm.reset();
  }
}
