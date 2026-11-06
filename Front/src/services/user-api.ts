import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';

/** Client for the users API. */
@Service()
export class UserApi {
  static readonly URL = `${environment.API_URL}/users`;

  private readonly http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(UserApi.URL);
  }

  create(request: SignUpRequest): Observable<User> {
    return this.http.post<User>(UserApi.URL, request);
  }
}
