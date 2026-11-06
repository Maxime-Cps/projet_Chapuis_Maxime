import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthSession } from './auth-session';
import { LINKS } from '../constants/routes';

/**
 * Sends the session token to the API as "Authorization: Bearer <token>".
 * When the API rejects it (expired, revoked secret), ends the session and opens the login page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  const token = session.token();
  if (token === null || !req.url.startsWith(environment.API_URL)) {
    return next(req);
  }

  const authorized = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(authorized).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === HttpStatusCode.Unauthorized) {
        session.end();
        router.navigateByUrl(LINKS.login);
      }

      return throwError(() => err);
    }),
  );
};
