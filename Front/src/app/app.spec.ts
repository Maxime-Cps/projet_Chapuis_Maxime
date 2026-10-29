import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { mockPollutionInterceptor } from '../services/mock-pollution.interceptor';
import { AuthSession } from '../services/auth-session';
import { User } from '../interfaces/User';

describe('App', () => {
  const USER: User = { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(withInterceptors([mockPollutionInterceptor])),
        provideRouter(routes),
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should redirect an unknown URL to the pollution form when signed in', async () => {
    TestBed.inject(AuthSession).start(USER);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/pollutionForm');

    expect(router.url).toBe('/');
  });

  it('should send a signed-out visitor to the sign-up page', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/pollutions');

    expect(router.url).toBe('/signup');
  });

  it('should keep a signed-in user away from the login page', async () => {
    TestBed.inject(AuthSession).start(USER);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/login');

    expect(router.url).toBe('/pollutions');
  });
});
