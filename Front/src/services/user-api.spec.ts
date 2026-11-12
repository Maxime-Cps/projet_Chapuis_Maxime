import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserApi } from './user-api';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';
import { Session } from '../interfaces/Session';

describe('UserApi', () => {
  const USER: User = { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };

  let service: UserApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET the list', () => {
    let result: User[] | undefined;

    service.getAll().subscribe((users) => (result = users));

    const req = http.expectOne(UserApi.URL);
    expect(req.request.method).toBe('GET');
    req.flush([USER]);

    expect(result).toEqual([USER]);
  });

  it('should POST the new user and return its session', () => {
    const request: SignUpRequest = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
    };
    const session: Session = { user: USER, token: 'signed-token' };
    let result: Session | undefined;

    service.create(request).subscribe((created) => (result = created));

    const req = http.expectOne(UserApi.URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(session);

    expect(result).toEqual(session);
  });

  it('should fail when the creation response is not a session', () => {
    let error: unknown;

    service
      .create({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', password: 'secret123' })
      .subscribe({ error: (err) => (error = err) });

    // A static host without the /api proxy answers 200 with an empty body
    http.expectOne(UserApi.URL).flush(null);

    expect(error).toBeInstanceOf(HttpErrorResponse);
  });
});
