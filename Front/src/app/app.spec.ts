import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { mockPollutionInterceptor } from '../services/mock-pollution.interceptor';

describe('App', () => {
  beforeEach(async () => {
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

  it('should redirect an unknown URL to the pollution form', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/pollutionForm');

    expect(router.url).toBe('/');
  });
});
