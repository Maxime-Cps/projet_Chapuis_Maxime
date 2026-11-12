import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SignUpRequest } from '../interfaces/SignUpRequest';
import { User } from '../interfaces/User';
import { Session } from '../interfaces/Session';
import { requireSession } from './session-response';

/** Client for the users API. */
@Service()
export class UserApi {
  static readonly URL = `${environment.API_URL}/users`;

  private readonly http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(UserApi.URL);
  }

  /** Creates the account and returns its session, already signed in. */
  create(request: SignUpRequest): Observable<Session> {
    return this.http.post<unknown>(UserApi.URL, request).pipe(map(requireSession));
  }
}
