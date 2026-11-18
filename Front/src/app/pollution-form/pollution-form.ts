import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map } from 'rxjs';
import {POLLUTION_TYPES, PollutionType} from '../../interfaces/PollutionType';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {PollutionRecap} from '../pollution-recap/pollution-recap';
import {notInFuture} from '../../validators/date.validators';
import {LocationPicker} from '../location-picker/location-picker';
import {GeoPosition} from '../../interfaces/GeoPosition';
import {toGeoPosition} from '../../utils/geo';
import {PinMode} from '../../map/city-map';
import {PollutionApi} from '../../services/pollution-api';
import {NewPollution, Pollution} from '../../interfaces/Pollution';
import {ID_PARAM, LINKS} from '../../constants/routes';
import {POLLUTION_ERRORS} from '../../constants/messages';
import {Icon} from '../icon/icon';
import {SignOut} from '../sign-out/sign-out';
import {MAX_DANGER_LEVEL} from '../../utils/pollution-level';

/** Integer, 0 or more (e.g. 42), as the API expects for the danger level. */
const WHOLE_NUMBER = /^\d+$/;

@Component({
  imports: [
    ReactiveFormsModule,
    PollutionRecap,
    LocationPicker,
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

  /** The pin is fixed while the report loads and once it is saved. */
  readonly pinMode = computed(() =>
    this.loading() || this.isSubmitted() ? PinMode.Fixed : PinMode.Movable,
  );
  readonly saving = signal(false);

  readonly pollutionTypeList = POLLUTION_TYPES;
  readonly maxDangerLevel = MAX_DANGER_LEVEL;

  readonly form : FormGroup = new FormGroup({
    label: new FormControl("", [Validators.required]),
    type: new FormControl<PollutionType | null>(null, [Validators.required]),
    description: new FormControl("", [Validators.required]),
    date: new FormControl("", [Validators.required, notInFuture]),
    place: new FormControl("", [Validators.required]),
    // Updated on blur: a half-typed coordinate (e.g. "4" for 48.85) would send the map away
    latitude: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(-90), Validators.max(90)],
      updateOn: 'blur',
    }),
    longitude: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(-180), Validators.max(180)],
      updateOn: 'blur',
    }),
    image: new FormControl(""),
    dangerLevel: new FormControl<number | null>(null, [
      Validators.required,
      Validators.pattern(WHOLE_NUMBER),
      Validators.max(MAX_DANGER_LEVEL),
    ]),
  })

  /** Position typed or picked on the map; null while incomplete or out of range. */
  readonly position = toSignal(
    this.form.valueChanges.pipe(map(() => this.typedPosition())),
    { initialValue: null },
  );

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

  /** Fills latitude and longitude from the map, as if typed. */
  pickLocation(position: GeoPosition | null) {
    if (position === null) {
      return;
    }

    this.form.patchValue(position);
    for (const control of [this.form.controls['latitude'], this.form.controls['longitude']]) {
      control.markAsDirty();
      control.markAsTouched();
    }
  }

  private typedPosition(): GeoPosition | null {
    const { latitude, longitude } = this.form.getRawValue();
    return toGeoPosition(latitude, longitude);
  }

  /** Loads an existing pollution into the form, matching its type to a radio option. */
  private fill(pollution: Pollution) {
    const { id, ...fields } = pollution;
    const type = POLLUTION_TYPES.find((t) => t.id === pollution.type.id) ?? null;
    this.form.patchValue({ ...fields, type });
  }

}
