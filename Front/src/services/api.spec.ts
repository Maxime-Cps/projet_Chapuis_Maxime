import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Api } from './api';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

describe('Api', () => {
  let service: Api;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should POST the sign-up request and return the user', () => {
    const request: SignUpRequest = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
    };
    const created: User = { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
    let result: User | undefined;

    service.signUp(request).subscribe((user) => (result = user));

    const req = http.expectOne(Api.SIGN_UP_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(created);

    expect(result).toEqual(created);
  });
});
