import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NewPollution} from '../../interfaces/Pollution';

@Component({
  imports: [DatePipe],
  selector: 'app-pollution-recap',
  styleUrl: './pollution-recap.scss',
  templateUrl: './pollution-recap.html',
})
export class PollutionRecap {
  @Input() data : NewPollution | undefined;

  /** Emitted when the user wants to go back to the form to edit it. */
  @Output() back = new EventEmitter<void>();

  /** Emitted when the user wants to start a new, empty report. */
  @Output() restart = new EventEmitter<void>();

  /** True for a short while after the coordinates were copied. */
  protected readonly copied = signal(false);

  Return() {
    this.back.emit();
  }

  async copyCoordinates() {
    if (!this.data) {
      return;
    }
    await navigator.clipboard?.writeText(`${this.data.latitude}, ${this.data.longitude}`);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
