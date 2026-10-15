import { TestBed } from '@angular/core/testing';
import { HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Api } from './api';
import { mockApiInterceptor, ALREADY_TAKEN_EMAIL } from './mock-api.interceptor';
import { SignUpRequest } from '../interfaces/SignUpRequest';

describe('mockApiInterceptor', () => {
  const REQUEST: SignUpRequest = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: 'secret123',
  };

  let api: Api;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))],
    });
    api = TestBed.inject(Api);
  });

  afterEach(() => vi.useRealTimers());

  it('should return the user without the password', async () => {
    const result = firstValueFrom(api.signUp(REQUEST));
    await vi.runAllTimersAsync();

    const user = await result;
    expect(user).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace', email: REQUEST.email });
    expect(user).not.toHaveProperty('password');
  });

  it('should reject the taken email with a conflict', async () => {
    const result = firstValueFrom(api.signUp({ ...REQUEST, email: ALREADY_TAKEN_EMAIL }));
    const assertion = expect(result).rejects.toMatchObject({ status: HttpStatusCode.Conflict });
    await vi.runAllTimersAsync();

    await assertion;
  });
});
