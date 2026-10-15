import { HttpInterceptorFn, HttpResponse, HttpStatusCode, HttpErrorResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import { Api } from './api';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

const LATENCY_MS = 500;

/** Email the mock treats as already registered, to demo the conflict error. */
export const TAKEN_EMAIL = 'taken@example.com';

/**
 * Fakes backend responses until the real API exists.
 * Enabled via `environment.MOCK_API`; unknown requests pass through.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.url !== Api.SIGN_UP_URL) {
    return next(req);
  }

  const { password, ...profile } = req.body as SignUpRequest;

  if (profile.email === TAKEN_EMAIL) {
    const conflict = new HttpErrorResponse({ status: HttpStatusCode.Conflict, url: req.url });
    return throwError(() => conflict).pipe(delay(LATENCY_MS));
  }

  const user: User = { id: Date.now(), ...profile };
  const created = new HttpResponse({ status: HttpStatusCode.Created, body: user });
  return of(created).pipe(delay(LATENCY_MS));
};
