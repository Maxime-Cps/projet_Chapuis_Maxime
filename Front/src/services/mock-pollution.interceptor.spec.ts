import { TestBed } from '@angular/core/testing';
import { HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PollutionApi } from './pollution-api';
import { mockPollutionInterceptor } from './mock-pollution.interceptor';
import { FormFields } from '../interfaces/FormFields';
import { POLLUTION_TYPES } from '../interfaces/PollutionType';

describe('mockPollutionInterceptor', () => {
  const FIELDS: FormFields = {
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockPollutionInterceptor]))],
    });
    api = TestBed.inject(PollutionApi);
  });

  it('should list the seeded pollutions', async () => {
    const pollutions = await firstValueFrom(api.getAll());

    expect(pollutions.length).toBeGreaterThan(0);
  });

  it('should create then read a pollution', async () => {
    const created = await firstValueFrom(api.create(FIELDS));

    expect(await firstValueFrom(api.getById(created.id))).toEqual({ ...FIELDS, id: created.id });
  });

  it('should update a pollution', async () => {
    const created = await firstValueFrom(api.create(FIELDS));

    await firstValueFrom(api.update({ ...created, label: 'Modifié' }));

    expect((await firstValueFrom(api.getById(created.id))).label).toBe('Modifié');
  });

  it('should delete a pollution', async () => {
    const created = await firstValueFrom(api.create(FIELDS));

    await firstValueFrom(api.delete(created.id));

    const ids = (await firstValueFrom(api.getAll())).map((p) => p.id);
    expect(ids).not.toContain(created.id);
  });

  it('should answer not found for an unknown id', async () => {
    await expect(firstValueFrom(api.getById(UNKNOWN_ID))).rejects.toMatchObject({
      status: HttpStatusCode.NotFound,
    });
  });
});
