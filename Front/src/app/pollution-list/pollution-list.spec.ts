import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PollutionList } from './pollution-list';
import { ListView } from '../../interfaces/ListView';
import { PollutionForm } from '../pollution-form/pollution-form';
import { routes } from '../app.routes';
import { PollutionApi } from '../../services/pollution-api';
import { Pollution } from '../../interfaces/Pollution';
import { POLLUTION_TYPES } from '../../interfaces/PollutionType';
import { AuthSession } from '../../services/auth-session';

describe('PollutionList', () => {
  const BASE: Omit<Pollution, 'id' | 'label' | 'type'> = {
    description: '',
    date: '2026-09-12T09:30',
    place: 'Paris',
    latitude: '48.85',
    longitude: '2.34',
    image: '',
  };
  const PLASTIC: Pollution = {
    ...BASE,
    id: 1,
    label: 'Bouteilles',
    type: POLLUTION_TYPES[0],
    image: 'https://example.com/bouteilles.jpg',
  };
  const AIR: Pollution = { ...BASE, id: 2, label: 'Fumée', type: POLLUTION_TYPES[4] };

  let fixture: ComponentFixture<PollutionList>;
  let component: PollutionList;
  let api: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sessionStorage.clear();
    api = { getAll: vi.fn().mockReturnValue(of([PLASTIC, AIR])), delete: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PollutionList],
      providers: [provideRouter(routes), { provide: PollutionApi, useValue: api }],
    }).compileComponents();

    TestBed.inject(AuthSession).start({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });
    fixture = TestBed.createComponent(PollutionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function labels(): string[] {
    const items = fixture.nativeElement.querySelectorAll('.item-label') as NodeListOf<HTMLElement>;
    return Array.from(items, (item) => item.textContent!.trim());
  }

  it('should show a loading state until the list arrives', async () => {
    const response = new Subject<Pollution[]>();
    api.getAll.mockReturnValue(response);
    const pending = TestBed.createComponent(PollutionList);
    await pending.whenStable();

    expect(pending.nativeElement.querySelector('#list-loading')).not.toBeNull();

    response.next([PLASTIC]);
    response.complete();
    await pending.whenStable();

    expect(pending.nativeElement.querySelector('#list-loading')).toBeNull();
  });

  it('should display every pollution', () => {
    expect(labels()).toEqual(['Bouteilles', 'Fumée']);
  });

  it('should link the report button to the pollution form', async () => {
    const router = TestBed.inject(Router);
    const link = fixture.nativeElement.querySelector('.panel-head a.btn-primary') as HTMLAnchorElement;

    await router.navigateByUrl(link.getAttribute('href')!);

    expect(router.routerState.snapshot.root.firstChild?.firstChild?.component).toBe(PollutionForm);
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

  it('should show photos only in the card view', async () => {
    expect(fixture.nativeElement.querySelector('.item-photo')).toBeNull();

    component.setView(ListView.Cards);
    await fixture.whenStable();

    const photo = fixture.nativeElement.querySelector('img.item-photo') as HTMLImageElement;
    expect(photo.getAttribute('src')).toBe(PLASTIC.image);
    expect(fixture.nativeElement.querySelector('.photo-empty')?.textContent).toContain('Aucune image');
    expect(labels()).toEqual(['Bouteilles', 'Fumée']);
  });

  it('should fall back to the placeholder when the image fails to load', async () => {
    component.setView(ListView.Cards);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('img.item-photo').dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('img.item-photo')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.photo-empty').length).toBe(2);
  });

  it('should restore the chosen view when the page is opened again', async () => {
    component.setView(ListView.Cards);

    const reopened = TestBed.createComponent(PollutionList);
    await reopened.whenStable();

    expect(reopened.componentInstance.view()).toBe(ListView.Cards);
    expect(reopened.nativeElement.querySelector('.list.cards')).not.toBeNull();
  });

  it('should mark the selected view as pressed', async () => {
    const cardsButton = fixture.nativeElement.querySelector('[aria-label="Cartes"]') as HTMLButtonElement;

    cardsButton.click();
    await fixture.whenStable();

    expect(cardsButton.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('[aria-label="Liste"]').getAttribute('aria-pressed')).toBe('false');
  });

  it('should keep the pollution when deletion is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.remove(PLASTIC);

    expect(api.delete).not.toHaveBeenCalled();
  });
});
