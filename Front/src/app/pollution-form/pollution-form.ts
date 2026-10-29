import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {POLLUTION_TYPES, PollutionType} from '../../interfaces/PollutionType';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {PollutionRecap} from '../pollution-recap/pollution-recap';
import {notInFuture} from '../../validators/date.validators';
import {MapBackdrop} from '../map-backdrop/map-backdrop';
import {PollutionApi} from '../../services/pollution-api';
import {NewPollution, Pollution} from '../../interfaces/Pollution';
import {ID_PARAM, LINKS} from '../../constants/routes';
import {POLLUTION_ERRORS} from '../../constants/messages';
import {Icon} from '../icon/icon';
import {SignOut} from '../sign-out/sign-out';

@Component({
  imports: [
    ReactiveFormsModule,
    PollutionRecap,
    MapBackdrop,
    RouterLink,
    Icon,
    SignOut
  ],
  selector: 'app-pollution-form',
  styleUrl: './pollution-form.scss',
  templateUrl: './pollution-form.html',
})
export class PollutionForm {
  private readonly api = inject(PollutionApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Id of the edited pollution, null until the report is first saved. */
  private id: number | null = null;

  readonly links = LINKS;
  readonly editing = this.route.snapshot.paramMap.has(ID_PARAM);
  readonly isSubmitted = signal(false);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly pollutionTypeList = POLLUTION_TYPES;

  readonly form : FormGroup = new FormGroup({
    label: new FormControl("", [Validators.required]),
    type: new FormControl<PollutionType | null>(null, [Validators.required]),
    description: new FormControl("", [Validators.required]),
    date: new FormControl("", [Validators.required, notInFuture]),
    place: new FormControl("", [Validators.required]),
    latitude: new FormControl<number | null>(null, [Validators.required, Validators.min(-90), Validators.max(90)]),
    longitude: new FormControl<number | null>(null, [Validators.required, Validators.min(-180), Validators.max(180)]),
    image: new FormControl(""),
  })

  constructor() {
    const param = this.route.snapshot.paramMap.get(ID_PARAM);
    if (param === null) {
      return;
    }

    this.id = Number(param);
    this.loading.set(true);
    this.api.getById(this.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (pollution) => this.fill(pollution),
      error: () => this.error.set(POLLUTION_ERRORS.load),
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);

    const fields: NewPollution = this.form.getRawValue();
    const save = this.id === null ? this.api.create(fields) : this.api.update({ ...fields, id: this.id });
    this.saving.set(true);
    save.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (pollution) => {
        this.id = pollution.id;
        this.isSubmitted.set(true);
      },
      error: () => this.error.set(POLLUTION_ERRORS.save),
    });
  }

  /** Clears the form to start a new report. */
  restart() {
    this.form.reset();
    this.id = null;
    this.isSubmitted.set(false);

    if (this.route.snapshot.paramMap.has(ID_PARAM)) {
      this.router.navigateByUrl(LINKS.report);
    }
  }

  /** Loads an existing pollution into the form, matching its type to a radio option. */
  private fill(pollution: Pollution) {
    const { id, ...fields } = pollution;
    const type = POLLUTION_TYPES.find((t) => t.id === pollution.type.id) ?? null;
    this.form.patchValue({ ...fields, type });
  }

}
