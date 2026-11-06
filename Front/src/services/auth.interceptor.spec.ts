import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthSession } from './auth-session';
import { UserApi } from './user-api';
import { routes } from '../app/app.routes';

describe('authInterceptor', () => {
  const TOKEN = 'signed-token';

  let http: HttpClient;
  let backend: HttpTestingController;
  let session: AuthSession;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter(routes),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSession);
  });

  afterEach(() => backend.verify());

  function signIn() {
    session.start({
      user: { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
      token: TOKEN,
    });
  }

  it('should send the token to the API', () => {
    signIn();

    http.get(UserApi.URL).subscribe();

    const req = backend.expectOne(UserApi.URL);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
  });

  it('should send no token when signed out', () => {
    http.get(UserApi.URL).subscribe();

    expect(backend.expectOne(UserApi.URL).request.headers.has('Authorization')).toBe(false);
  });

  it('should keep the token away from other hosts', () => {
    signIn();
    const url = 'https://tiles.example.com/0/0/0.png';

    http.get(url).subscribe();

    expect(backend.expectOne(url).request.headers.has('Authorization')).toBe(false);
  });

  it('should end the session and open the login page when the API rejects the token', () => {
    signIn();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');

    http.get(UserApi.URL).subscribe({ error: () => undefined });
    backend.expectOne(UserApi.URL).flush(null, { status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized' });

    expect(session.isSignedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
