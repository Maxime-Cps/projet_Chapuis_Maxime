import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserApi } from './user-api';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

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

  it('should POST the new user and return it', () => {
    const request: SignUpRequest = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
    };
    let result: User | undefined;

    service.create(request).subscribe((user) => (result = user));

    const req = http.expectOne(UserApi.URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(USER);

    expect(result).toEqual(USER);
  });
});
