import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PollutionApi } from './pollution-api';
import { Pollution } from '../interfaces/Pollution';
import { POLLUTION_TYPES } from '../interfaces/PollutionType';

describe('PollutionApi', () => {
  const POLLUTION: Pollution = {
    id: 4,
    label: 'Sacs plastiques',
    type: POLLUTION_TYPES[0],
    description: 'Sacs dans la haie.',
    date: '2026-10-01T10:00',
    place: 'Lyon',
    latitude: '45.76',
    longitude: '4.83',
    image: '',
  };

  let service: PollutionApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PollutionApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should GET the list', () => {
    service.getAll().subscribe();

    expect(http.expectOne(PollutionApi.URL).request.method).toBe('GET');
  });

  it('should GET one pollution by id', () => {
    service.getById(POLLUTION.id).subscribe();

    expect(http.expectOne(PollutionApi.itemUrl(POLLUTION.id)).request.method).toBe('GET');
  });

  it('should POST the fields to create', () => {
    const { id, ...fields } = POLLUTION;
    service.create(fields).subscribe();

    const req = http.expectOne(PollutionApi.URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(fields);
  });

  it('should PUT the pollution to update', () => {
    service.update(POLLUTION).subscribe();

    const req = http.expectOne(PollutionApi.itemUrl(POLLUTION.id));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(POLLUTION);
  });

  it('should DELETE by id', () => {
    service.delete(POLLUTION.id).subscribe();

    expect(http.expectOne(PollutionApi.itemUrl(POLLUTION.id)).request.method).toBe('DELETE');
  });
});
