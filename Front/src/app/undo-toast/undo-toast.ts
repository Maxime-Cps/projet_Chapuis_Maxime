import { Component, inject } from '@angular/core';
import { PollutionDeletion, UNDO_DELAY_MS } from '../../services/pollution-deletion';

/**
 * Notice of a deletion, with a button to undo it until it is sent.
 * The bar empties over the time left. Also reports a deletion that failed.
 */
@Component({
  selector: 'app-undo-toast',
  styleUrl: './undo-toast.scss',
  template: `
    <div class="region" role="status">
      @if (deletion.pending(); as pollution) {
        <div class="toast">
          <p>« {{ pollution.label }} » supprimé.</p>
          <button type="button" class="btn-secondary btn-compact" (click)="deletion.undo()">Annuler</button>
          <span class="countdown" [style.animation-duration.ms]="delayMs"></span>
        </div>
      } @else if (deletion.error(); as error) {
        <div class="toast">
          <p class="error">{{ error }}</p>
          <button type="button" class="btn-secondary btn-compact" (click)="deletion.error.set(null)">Fermer</button>
        </div>
      }
    </div>
  `,
})
export class UndoToast {
  protected readonly deletion = inject(PollutionDeletion);
  protected readonly delayMs = UNDO_DELAY_MS;
}
