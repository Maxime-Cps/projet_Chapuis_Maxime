import { Component } from '@angular/core';
import {PollutionType} from '../../interfaces/PollutionType';
import {
  FormControl,
  FormGroup,
  NgForm,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {PollutionRecap} from '../pollution-recap/pollution-recap';
import {notInFuture} from '../../validators/date.validators';

@Component({
  imports: [
    ReactiveFormsModule,
    PollutionRecap
  ],
  selector: 'app-pollution-form',
  styleUrl: './pollution-form.scss',
  templateUrl: './pollution-form.html',
})
export class PollutionForm {

  isSubmitted = false;

  readonly pollutionTypeList: PollutionType[] = [
    { id : 0, name : "Plastique" },
    { id : 1, name : "Chimique" },
    { id : 2, name :  "Dépôt sauvage" },
    { id : 3, name : "Eau" },
    { id : 4, name : "Air" },
    { id : 5, name : "Autre" },
  ];

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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitted = true;
  }

}
