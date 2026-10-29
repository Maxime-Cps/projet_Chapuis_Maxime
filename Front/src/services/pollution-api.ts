import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NewPollution, Pollution } from '../interfaces/Pollution';

/** CRUD client for the pollution reports API. */
@Service()
export class PollutionApi {
  static readonly URL = `${environment.API_URL}/pollutions`;

  private readonly http = inject(HttpClient);

  getAll(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(PollutionApi.URL);
  }

  getById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(PollutionApi.itemUrl(id));
  }

  create(pollution: NewPollution): Observable<Pollution> {
    return this.http.post<Pollution>(PollutionApi.URL, pollution);
  }

  update(pollution: Pollution): Observable<Pollution> {
    return this.http.put<Pollution>(PollutionApi.itemUrl(pollution.id), pollution);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(PollutionApi.itemUrl(id));
  }

  static itemUrl(id: number): string {
    return `${PollutionApi.URL}/${id}`;
  }
}
