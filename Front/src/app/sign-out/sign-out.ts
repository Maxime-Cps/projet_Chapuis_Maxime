import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession } from '../../services/auth-session';
import { LINKS } from '../../constants/routes';
import { Icon } from '../icon/icon';

/** Ends the session and returns to the sign-up page. */
@Component({
  imports: [Icon],
  selector: 'app-sign-out',
  template: `
    <button type="button" class="btn-secondary btn-compact" (click)="signOut()">
      <app-icon name="log-out" />Se déconnecter
    </button>
  `,
})
export class SignOut {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  signOut() {
    this.session.end();
    this.router.navigateByUrl(LINKS.signUp);
  }
}
