import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSession } from '../../services/auth-session';
import { AuthRedirect } from '../../services/auth-redirect';
import { Icon } from '../icon/icon';

/** Returns to the sign-up page and ends the session, unless the page asked to stay (unsaved changes). */
@Component({
  imports: [Icon],
  selector: 'app-sign-out',
  template: `
    <button type="button" class="btn-secondary btn-compact" (click)="signOut()">
      <app-icon name="log-out" />Se déconnecter
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignOut {
  private readonly session = inject(AuthSession);
  private readonly redirect = inject(AuthRedirect);

  async signOut() {
    if (!(await this.redirect.leaveForSignOut())) {
      return;
    }

    this.session.end();
  }
}
