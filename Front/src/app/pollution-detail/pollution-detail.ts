import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { MapBackdrop } from '../map-backdrop/map-backdrop';
import { ID_PARAM, LINKS } from '../../constants/routes';
import { deleteConfirmation, POLLUTION_ERRORS } from '../../constants/messages';
import { Icon } from '../icon/icon';
import { SignOut } from '../sign-out/sign-out';

@Component({
  imports: [DatePipe, RouterLink, MapBackdrop, Icon, SignOut],
  selector: 'app-pollution-detail',
  styleUrl: './pollution-detail.scss',
  templateUrl: './pollution-detail.html',
})
export class PollutionDetail {
  private readonly api = inject(PollutionApi);
  private readonly router = inject(Router);

  readonly links = LINKS;
  readonly pollution = signal<Pollution | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly deleting = signal(false);

  constructor() {
    const id = Number(inject(ActivatedRoute).snapshot.paramMap.get(ID_PARAM));

    this.api.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (pollution) => this.pollution.set(pollution),
      error: (err: HttpErrorResponse) => {
        const notFound = err.status === HttpStatusCode.NotFound;
        this.error.set(notFound ? POLLUTION_ERRORS.notFound : POLLUTION_ERRORS.load);
      },
    });
  }

  remove(pollution: Pollution) {
    if (!confirm(deleteConfirmation(pollution.label))) {
      return;
    }

    this.error.set(null);
    this.deleting.set(true);
    this.api.delete(pollution.id).pipe(finalize(() => this.deleting.set(false))).subscribe({
      next: () => this.router.navigateByUrl(LINKS.list),
      error: () => this.error.set(POLLUTION_ERRORS.delete),
    });
  }
}
