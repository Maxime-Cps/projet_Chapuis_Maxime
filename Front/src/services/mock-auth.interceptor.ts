import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthApi } from './auth-api';
import { withLatency } from './mock-latency';
import { LoginRequest } from '../interfaces/LoginRequest';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

export const ALREADY_TAKEN_EMAIL = 'maxime@test.com';

/** Password of the seeded {@link ALREADY_TAKEN_EMAIL} account, for trying the login page. */
export const SEED_PASSWORD = 'password123';

interface Account {
  user: User;
  password: string;
}

const SEED: Account[] = [
  {
    user: { id: 1, firstName: 'Maxime', lastName: 'Test', email: ALREADY_TAKEN_EMAIL },
    password: SEED_PASSWORD,
  },
];

/** In-memory account table backing the mock auth API. */
@Service()
export class MockUserStore {
  private accounts = structuredClone(SEED);

  has(email: string): boolean {
    return this.accounts.some((a) => a.user.email === email);
  }

  add({ password, ...profile }: SignUpRequest): User {
    const user: User = { id: Date.now(), ...profile };
    this.accounts.push({ user, password });
    return structuredClone(user);
  }

  /** Returns the user matching both credentials, or undefined. */
  authenticate({ email, password }: LoginRequest): User | undefined {
    const account = this.accounts.find((a) => a.user.email === email && a.password === password);
    return structuredClone(account?.user);
  }
}

/**
 * Serves the auth endpoints from {@link MockUserStore}.
 *
 * @example POST /api/auth/signup, POST /api/auth/login
 */
export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST') {
    return next(req);
  }

  if (req.url === AuthApi.SIGN_UP_URL) {
    return signUp(req, inject(MockUserStore)).pipe(withLatency());
  }

  if (req.url === AuthApi.LOGIN_URL) {
    return login(req, inject(MockUserStore)).pipe(withLatency());
  }

  return next(req);
};

function signUp(req: HttpRequest<unknown>, store: MockUserStore) {
  const request = req.body as SignUpRequest;
  if (store.has(request.email)) {
    return fail(req, HttpStatusCode.Conflict);
  }

  return of(new HttpResponse({ status: HttpStatusCode.Created, body: store.add(request) }));
}

function login(req: HttpRequest<unknown>, store: MockUserStore) {
  const user = store.authenticate(req.body as LoginRequest);
  if (!user) {
    return fail(req, HttpStatusCode.Unauthorized);
  }

  return of(new HttpResponse({ status: HttpStatusCode.Ok, body: user }));
}

function fail(req: HttpRequest<unknown>, status: HttpStatusCode) {
  return throwError(() => new HttpErrorResponse({ status, url: req.url }));
}
