import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PollutionList } from './pollution-list';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';

describe('PollutionList', () => {
  const BASE: Omit<Pollution, 'id' | 'label' | 'type'> = {
    description: '',
    date: '2026-09-12T09:30',
    place: 'Paris',
    latitude: '48.85',
    longitude: '2.34',
    image: '',
  };
  const PLASTIC: Pollution = { ...BASE, id: 1, label: 'Bouteilles', type: POLLUTION_TYPES[0] };
  const AIR: Pollution = { ...BASE, id: 2, label: 'Fumée', type: POLLUTION_TYPES[4] };

  let fixture: ComponentFixture<PollutionList>;
  let component: PollutionList;
  let api: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { getAll: vi.fn().mockReturnValue(of([PLASTIC, AIR])), delete: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PollutionList],
      providers: [provideRouter([]), { provide: PollutionApi, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function labels(): string[] {
    const items = fixture.nativeElement.querySelectorAll('.item-label') as NodeListOf<HTMLElement>;
    return Array.from(items, (item) => item.textContent!.trim());
  }

  it('should display every pollution', () => {
    expect(labels()).toEqual(['Bouteilles', 'Fumée']);
  });

  it('should display only pollutions matching the filter', async () => {
    component.filterForm.controls.typeId.setValue(AIR.type.id);
    await fixture.whenStable();

    expect(labels()).toEqual(['Fumée']);
  });

  it('should remove a pollution once deletion is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    api.delete.mockReturnValue(of(undefined));

    component.remove(PLASTIC);
    await fixture.whenStable();

    expect(api.delete).toHaveBeenCalledWith(PLASTIC.id);
    expect(labels()).toEqual(['Fumée']);
  });

  it('should keep the pollution when deletion is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.remove(PLASTIC);

    expect(api.delete).not.toHaveBeenCalled();
  });
});
