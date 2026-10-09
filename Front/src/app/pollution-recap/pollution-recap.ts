import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormFields} from '../../interfaces/FormFields';

@Component({
  imports: [DatePipe],
  selector: 'app-pollution-recap',
  styleUrl: './pollution-recap.scss',
  templateUrl: './pollution-recap.html',
})
export class PollutionRecap {
  @Input() data : FormFields | undefined;

  /** Emitted when the user wants to go back to the form to edit it. */
  @Output() back = new EventEmitter<void>();

  Return() {
    this.back.emit();
  }
}

