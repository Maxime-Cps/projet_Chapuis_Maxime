import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { MapBackdrop } from '../map-backdrop/map-backdrop';

const NOT_FOUND_ERROR = 'Signalement introuvable.';
const LOAD_ERROR = 'Impossible de charger le signalement.';
const DELETE_ERROR = 'La suppression a échoué. Réessayez.';
const LIST_ROUTE = '/pollutions';

@Component({
  imports: [DatePipe, RouterLink, MapBackdrop],
  selector: 'app-pollution-detail',
  styleUrl: './pollution-detail.scss',
  templateUrl: './pollution-detail.html',
})
export class PollutionDetail {
  private readonly api = inject(PollutionApi);
  private readonly router = inject(Router);

  readonly listRoute = LIST_ROUTE;
  readonly pollution = signal<Pollution | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

    this.api.getById(id).subscribe({
      next: (pollution) => this.pollution.set(pollution),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === HttpStatusCode.NotFound ? NOT_FOUND_ERROR : LOAD_ERROR);
      },
    });
  }

  remove(pollution: Pollution) {
    if (!confirm(`Supprimer « ${pollution.label} » ?`)) {
      return;
    }

    this.error.set(null);
    this.api.delete(pollution.id).subscribe({
      next: () => this.router.navigateByUrl(LIST_ROUTE),
      error: () => this.error.set(DELETE_ERROR),
    });
  }
}
