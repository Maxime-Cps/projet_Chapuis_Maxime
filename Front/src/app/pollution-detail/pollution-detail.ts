import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { MapBackdrop } from '../map-backdrop/map-backdrop';
import { ID_PARAM, LINKS } from '../../constants/routes';
import { POLLUTION_ERRORS } from '../../constants/messages';
import { Icon } from '../icon/icon';
import { SignOut } from '../sign-out/sign-out';
import { PollutionScene } from '../pollution-scene/pollution-scene';
import { DangerGauge } from '../danger-gauge/danger-gauge';
import { PollutionDeletion } from '../../services/pollution-deletion';
import { toGeoPosition } from '../../utils/geo';
import { reportTransition } from '../../utils/view-transition';

@Component({
  imports: [DatePipe, RouterLink, MapBackdrop, Icon, SignOut, PollutionScene, DangerGauge],
  selector: 'app-pollution-detail',
  styleUrl: './pollution-detail.scss',
  templateUrl: './pollution-detail.html',
})
export class PollutionDetail {
  private readonly api = inject(PollutionApi);
  private readonly router = inject(Router);
  private readonly deletion = inject(PollutionDeletion);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get(ID_PARAM));

  readonly links = LINKS;
  readonly pollution = signal<Pollution | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  /** Shared with the row of the list, which unfolds into this panel. */
  readonly transitionName = reportTransition(this.id);

  /** Whether the report can be placed in 3D: it has valid coordinates. */
  readonly located = computed(() => {
    const pollution = this.pollution();
    return pollution !== null && toGeoPosition(pollution.latitude, pollution.longitude) !== null;
  });

  constructor() {
    this.api.getById(this.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (pollution) => this.pollution.set(pollution),
      error: (err: HttpErrorResponse) => {
        const notFound = err.status === HttpStatusCode.NotFound;
        this.error.set(notFound ? POLLUTION_ERRORS.notFound : POLLUTION_ERRORS.load);
      },
    });
  }

  /** Back to the list, where the deletion can be undone for a few seconds. */
  remove(pollution: Pollution) {
    this.deletion.schedule(pollution);
    this.router.navigateByUrl(LINKS.list);
  }
}
