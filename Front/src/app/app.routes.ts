import { Routes } from '@angular/router';
import { PAGE_TITLES, ROUTE_PATHS } from '../constants/routes';
import { signedInGuard, signedOutGuard } from '../guards/auth.guards';

/**
 * Public pages come first: the signed-in block matches every URL and would
 * otherwise send signed-out visitors of /signup back to /signup.
 */
export const routes: Routes = [
  {
    path: ROUTE_PATHS.signUp,
    loadComponent: () => import('./sign-up/sign-up').then((m) => m.SignUp),
    title: PAGE_TITLES.signUp,
    canActivate: [signedOutGuard],
  },
  {
    path: ROUTE_PATHS.login,
    loadComponent: () => import('./login/login').then((m) => m.Login),
    title: PAGE_TITLES.login,
    canActivate: [signedOutGuard],
  },
  {
    path: '',
    canMatch: [signedInGuard],
    loadChildren: () => import('./signed-in.routes').then((m) => m.SIGNED_IN_ROUTES),
  },
  { path: '**', redirectTo: ROUTE_PATHS.report },
];
