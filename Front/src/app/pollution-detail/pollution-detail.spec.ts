import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PollutionDetail } from './pollution-detail';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';

describe('PollutionDetail', () => {
  const POLLUTION: Pollution = {
    id: 3,
    label: 'Gravats en forêt',
    type: POLLUTION_TYPES[2],
    description: 'Sacs de gravats.',
    date: '2026-10-14T14:00',
    place: 'Chantilly',
    latitude: '49.18',
    longitude: '2.46',
    image: '',
  };

  let api: { getById: ReturnType<typeof vi.fn> };

  async function render(): Promise<ComponentFixture<PollutionDetail>> {
    await TestBed.configureTestingModule({
      imports: [PollutionDetail],
      providers: [
        provideRouter([]),
        { provide: PollutionApi, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: `${POLLUTION.id}` }) } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PollutionDetail);
    await fixture.whenStable();
    return fixture;
  }

  it('should display the pollution of the route id', async () => {
    api = { getById: vi.fn().mockReturnValue(of(POLLUTION)) };

    const fixture = await render();

    expect(api.getById).toHaveBeenCalledWith(POLLUTION.id);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(POLLUTION.label);
  });

  it('should display an error for an unknown id', async () => {
    const notFound = new HttpErrorResponse({ status: HttpStatusCode.NotFound });
    api = { getById: vi.fn().mockReturnValue(throwError(() => notFound)) };

    const fixture = await render();

    const error = fixture.nativeElement.querySelector('#detail-error') as HTMLElement | null;
    expect(error?.textContent).toContain('introuvable');
  });
});
