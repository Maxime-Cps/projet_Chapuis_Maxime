import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginRequest } from '../interfaces/LoginRequest';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

/** Client for the authentication API. */
@Service()
export class AuthApi {
  static readonly SIGN_UP_URL = `${environment.API_URL}/auth/signup`;
  static readonly LOGIN_URL = `${environment.API_URL}/auth/login`;

  private readonly http = inject(HttpClient);

  signUp(request: SignUpRequest): Observable<User> {
    return this.http.post<User>(AuthApi.SIGN_UP_URL, request);
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(AuthApi.LOGIN_URL, request);
  }
}
