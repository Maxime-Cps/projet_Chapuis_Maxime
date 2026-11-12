import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthApi } from './auth-api';
import { LoginRequest } from '../interfaces/LoginRequest';
import { Session } from '../interfaces/Session';

describe('AuthApi', () => {
  let service: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should POST the login request and return the session', () => {
    const request: LoginRequest = { email: 'ada@example.com', password: 'secret123' };
    const session: Session = {
      user: { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
      token: 'signed-token',
    };
    let result: Session | undefined;

    service.login(request).subscribe((s) => (result = s));

    const req = http.expectOne(AuthApi.LOGIN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(session);

    expect(result).toEqual(session);
  });

  it('should fail when the response is not a session', () => {
    let error: unknown;

    service.login({ email: 'ada@example.com', password: 'secret123' }).subscribe({
      error: (err) => (error = err),
    });

    // A static host without the /api proxy answers 200 with an empty body
    http.expectOne(AuthApi.LOGIN_URL).flush(null);

    expect(error).toBeInstanceOf(HttpErrorResponse);
  });
});
