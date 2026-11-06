import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
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
});
