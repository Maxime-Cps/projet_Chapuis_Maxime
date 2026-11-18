import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthSession } from '../services/auth-session';
import { AuthRedirect } from '../services/auth-redirect';
import { LINKS } from '../constants/routes';

/**
 * Lets signed-in users through, sends the others to the sign-up page.
 * Used as `canMatch`, so lazy pages are not even downloaded for signed-out visitors.
 */
export const signedInGuard: CanMatchFn = () => {
  return inject(AuthSession).isSignedIn() || inject(AuthRedirect).toSignUp();
};

/**
 * Keeps signed-in users away from sign-up and login, sending them to the pollution list.
 * Lets a signing-out user through: the session ends once the navigation succeeded.
 */
export const signedOutGuard: CanActivateFn = () => {
  if (!inject(AuthSession).isSignedIn() || inject(AuthRedirect).isSigningOut()) {
    return true;
  }

  return inject(Router).parseUrl(LINKS.list);
};
