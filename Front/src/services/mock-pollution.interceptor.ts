import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { PollutionApi } from './pollution-api';
import { FormFields } from '../interfaces/FormFields';
import { Pollution } from '../interfaces/Pollution';
import { POLLUTION_TYPES } from '../interfaces/PollutionType';

const SEED: Pollution[] = [
  {
    id: 1,
    label: 'Bouteilles sur la berge',
    type: POLLUTION_TYPES[0],
    description: 'Une vingtaine de bouteilles plastiques accumulées sous le pont.',
    date: '2026-09-12T09:30',
    place: 'Quai de la Seine, Paris',
    latitude: '48.8530',
    longitude: '2.3499',
    image: '',
  },
  {
    id: 2,
    label: 'Fumée noire',
    type: POLLUTION_TYPES[4],
    description: "Fumée épaisse s'échappant d'un entrepôt.",
    date: '2026-10-02T18:15',
    place: 'Zone industrielle, Compiègne',
    latitude: '49.4179',
    longitude: '2.8261',
    image: '',
  },
  {
    id: 3,
    label: 'Gravats en forêt',
    type: POLLUTION_TYPES[2],
    description: 'Sacs de gravats et pots de peinture abandonnés au bord du chemin.',
    date: '2026-10-14T14:00',
    place: 'Forêt de Chantilly',
    latitude: '49.1866',
    longitude: '2.4614',
    image: '',
  },
];

/** In-memory pollution table backing the mock API. */
@Service()
export class MockPollutionStore {
  private pollutions = structuredClone(SEED);
  private nextId = SEED.length + 1;

  all(): Pollution[] {
    return structuredClone(this.pollutions);
  }

  find(id: number): Pollution | undefined {
    return structuredClone(this.pollutions.find((p) => p.id === id));
  }

  add(fields: FormFields): Pollution {
    const pollution: Pollution = { ...fields, id: this.nextId++ };
    this.pollutions.push(pollution);
    return structuredClone(pollution);
  }

  replace(pollution: Pollution): Pollution {
    this.pollutions = this.pollutions.map((p) => (p.id === pollution.id ? pollution : p));
    return structuredClone(pollution);
  }

  remove(id: number): void {
    this.pollutions = this.pollutions.filter((p) => p.id !== id);
  }
}

/**
 * Serves the pollution CRUD endpoints from {@link MockPollutionStore}.
 *
 * @example GET /api/pollutions, GET|PUT|DELETE /api/pollutions/3, POST /api/pollutions
 */
export const mockPollutionInterceptor: HttpInterceptorFn = (req, next) => {
  const isCollection = req.url === PollutionApi.URL;
  if (!isCollection && !req.url.startsWith(`${PollutionApi.URL}/`)) {
    return next(req);
  }

  const store = inject(MockPollutionStore);

  if (isCollection) {
    return collection(req, store);
  }

  const id = Number(req.url.slice(PollutionApi.URL.length + 1));
  return item(req, store, id);
};

function collection(req: HttpRequest<unknown>, store: MockPollutionStore) {
  if (req.method === 'GET') {
    return respond(HttpStatusCode.Ok, store.all());
  }

  if (req.method === 'POST') {
    return respond(HttpStatusCode.Created, store.add(req.body as FormFields));
  }

  return fail(req, HttpStatusCode.MethodNotAllowed);
}

function item(req: HttpRequest<unknown>, store: MockPollutionStore, id: number) {
  const found = store.find(id);
  if (!found) {
    return fail(req, HttpStatusCode.NotFound);
  }

  if (req.method === 'GET') {
    return respond(HttpStatusCode.Ok, found);
  }

  if (req.method === 'PUT') {
    const pollution = { ...(req.body as Pollution), id };
    return respond(HttpStatusCode.Ok, store.replace(pollution));
  }

  if (req.method === 'DELETE') {
    store.remove(id);
    return respond(HttpStatusCode.NoContent, null);
  }

  return fail(req, HttpStatusCode.MethodNotAllowed);
}

function respond<T>(status: HttpStatusCode, body: T): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status, body }));
}

function fail(req: HttpRequest<unknown>, status: HttpStatusCode) {
  return throwError(() => new HttpErrorResponse({ status, url: req.url }));
}
