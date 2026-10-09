import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PollutionForm} from './pollution-form/pollution-form';

@Component({
  imports: [PollutionForm],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('exercice1');
}
