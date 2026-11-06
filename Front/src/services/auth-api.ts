import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginRequest } from '../interfaces/LoginRequest';
import { Session } from '../interfaces/Session';

/** Client for the authentication API. */
@Service()
export class AuthApi {
  static readonly LOGIN_URL = `${environment.API_URL}/auth/login`;

  private readonly http = inject(HttpClient);

  login(request: LoginRequest): Observable<Session> {
    return this.http.post<Session>(AuthApi.LOGIN_URL, request);
  }
}
