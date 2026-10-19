import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { FormFields } from '../interfaces/FormFields';
import { Pollution } from '../interfaces/Pollution';

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

  create(fields: FormFields): Observable<Pollution> {
    return this.http.post<Pollution>(PollutionApi.URL, fields);
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
