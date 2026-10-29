import { TestBed } from '@angular/core/testing';
import { HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from './auth-api';
import { mockAuthInterceptor, ALREADY_TAKEN_EMAIL, SEED_PASSWORD } from './mock-auth.interceptor';
import { SignUpRequest } from '../interfaces/SignUpRequest';

describe('mockAuthInterceptor', () => {
  const REQUEST: SignUpRequest = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: 'secret123',
  };

  let api: AuthApi;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockAuthInterceptor]))],
    });
    api = TestBed.inject(AuthApi);
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

  it('should log in the seeded account', async () => {
    const result = firstValueFrom(api.login({ email: ALREADY_TAKEN_EMAIL, password: SEED_PASSWORD }));
    await vi.runAllTimersAsync();

    expect(await result).toMatchObject({ email: ALREADY_TAKEN_EMAIL });
  });

  it('should log in an account created by sign-up', async () => {
    const created = firstValueFrom(api.signUp(REQUEST));
    await vi.runAllTimersAsync();
    await created;

    const result = firstValueFrom(api.login({ email: REQUEST.email, password: REQUEST.password }));
    await vi.runAllTimersAsync();

    expect(await result).toMatchObject({ email: REQUEST.email });
  });

  it('should reject a wrong password as unauthorized', async () => {
    const result = firstValueFrom(api.login({ email: ALREADY_TAKEN_EMAIL, password: 'wrong' }));
    const assertion = expect(result).rejects.toMatchObject({ status: HttpStatusCode.Unauthorized });
    await vi.runAllTimersAsync();

    await assertion;
  });
});
