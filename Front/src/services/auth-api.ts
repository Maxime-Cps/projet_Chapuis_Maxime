import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

/** Client for the authentication API. */
@Service()
export class AuthApi {
  static readonly SIGN_UP_URL = `${environment.API_URL}/auth/signup`;

  private readonly http = inject(HttpClient);

  signUp(request: SignUpRequest): Observable<User> {
    return this.http.post<User>(AuthApi.SIGN_UP_URL, request);
  }
}
