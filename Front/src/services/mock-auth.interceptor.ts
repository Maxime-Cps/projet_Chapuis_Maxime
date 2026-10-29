import { HttpInterceptorFn, HttpResponse, HttpStatusCode, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthApi } from './auth-api';
import { withLatency } from './mock-latency';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

export const ALREADY_TAKEN_EMAIL = 'maxime@test.com';

export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.url !== AuthApi.SIGN_UP_URL) {
    return next(req);
  }

  const { password, ...profile } = req.body as SignUpRequest;

  if (profile.email === ALREADY_TAKEN_EMAIL) {
    const conflict = new HttpErrorResponse({ status: HttpStatusCode.Conflict, url: req.url });
    return throwError(() => conflict).pipe(withLatency());
  }

  const user: User = { id: Date.now(), ...profile };
  const created = new HttpResponse({ status: HttpStatusCode.Created, body: user });
  return of(created).pipe(withLatency());
};
