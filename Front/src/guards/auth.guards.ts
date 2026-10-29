import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../services/auth-session';
import { LINKS } from '../constants/routes';

/** Lets signed-in users through, sends the others to the sign-up page. */
export const signedInGuard: CanActivateFn = () => {
  return inject(AuthSession).isSignedIn() || inject(Router).parseUrl(LINKS.signUp);
};

/** Keeps signed-in users away from sign-up and login, sending them to the pollution list. */
export const signedOutGuard: CanActivateFn = () => {
  return !inject(AuthSession).isSignedIn() || inject(Router).parseUrl(LINKS.list);
};
