import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { mockAuthInterceptor } from '../services/mock-auth.interceptor';
import { mockPollutionInterceptor } from '../services/mock-pollution.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([mockAuthInterceptor, mockPollutionInterceptor])),
    provideRouter(routes)
  ]
};
