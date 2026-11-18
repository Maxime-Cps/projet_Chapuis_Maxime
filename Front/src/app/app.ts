import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UndoToast } from './undo-toast/undo-toast';

@Component({
  imports: [RouterOutlet, UndoToast],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
