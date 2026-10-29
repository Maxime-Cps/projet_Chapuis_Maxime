import { TestBed } from '@angular/core/testing';
import { HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { PollutionApi } from './pollution-api';
import { mockPollutionInterceptor } from './mock-pollution.interceptor';
import { NewPollution } from '../interfaces/Pollution';
import { POLLUTION_TYPES } from '../interfaces/PollutionType';

describe('mockPollutionInterceptor', () => {
  const FIELDS: NewPollution = {
    label: 'Huile dans le canal',
    type: POLLUTION_TYPES[1],
    description: 'Nappe irisée.',
    date: '2026-10-10T08:00',
    place: 'Canal Saint-Martin',
    latitude: '48.87',
    longitude: '2.36',
    image: '',
  };
  const UNKNOWN_ID = 999;

  let api: PollutionApi;

  /** Resolves a mock response once its simulated latency has elapsed. */
  async function settle<T>(request: Observable<T>): Promise<T> {
    const result = firstValueFrom(request);
    await vi.runAllTimersAsync();
    return result;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockPollutionInterceptor]))],
    });
    api = TestBed.inject(PollutionApi);
  });

  afterEach(() => vi.useRealTimers());

  it('should list the seeded pollutions', async () => {
    const pollutions = await settle(api.getAll());

    expect(pollutions.length).toBeGreaterThan(0);
  });

  it('should create then read a pollution', async () => {
    const created = await settle(api.create(FIELDS));

    expect(await settle(api.getById(created.id))).toEqual({ ...FIELDS, id: created.id });
  });

  it('should update a pollution', async () => {
    const created = await settle(api.create(FIELDS));

    await settle(api.update({ ...created, label: 'Modifié' }));

    expect((await settle(api.getById(created.id))).label).toBe('Modifié');
  });

  it('should delete a pollution', async () => {
    const created = await settle(api.create(FIELDS));

    await settle(api.delete(created.id));

    const ids = (await settle(api.getAll())).map((p) => p.id);
    expect(ids).not.toContain(created.id);
  });

  it('should answer not found for an unknown id', async () => {
    const result = firstValueFrom(api.getById(UNKNOWN_ID));
    const assertion = expect(result).rejects.toMatchObject({ status: HttpStatusCode.NotFound });
    await vi.runAllTimersAsync();

    await assertion;
  });
});
