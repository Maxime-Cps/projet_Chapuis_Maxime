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
import { FakeCityMap, provideFakeMapEngine } from '../../map/testing/fake-map-engine';
import { PollutionDeletion } from '../../services/pollution-deletion';
import { MapView } from '../../map/city-map';

describe('PollutionList', () => {
  const BASE: Omit<Pollution, 'id' | 'label' | 'type'> = {
    description: '',
    date: '2026-09-12T09:30',
    place: 'Paris',
    latitude: '48.85',
    longitude: '2.34',
    image: '',
    dangerLevel: 10,
  };
  const PLASTIC: Pollution = {
    ...BASE,
    id: 1,
    label: 'Bouteilles',
    type: POLLUTION_TYPES[0],
    image: 'https://example.com/bouteilles.jpg',
  };
  const AIR: Pollution = { ...BASE, id: 2, label: 'Fumée', type: POLLUTION_TYPES[4], dangerLevel: 80 };

  let fixture: ComponentFixture<PollutionList>;
  let component: PollutionList;
  let api: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let maps: FakeCityMap[];

  beforeEach(async () => {
    sessionStorage.clear();
    maps = [];
    api = { getAll: vi.fn().mockReturnValue(of([PLASTIC, AIR])), delete: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PollutionList],
      providers: [
        provideRouter(routes),
        provideFakeMapEngine(maps),
        { provide: PollutionApi, useValue: api },
      ],
    }).compileComponents();

    TestBed.inject(AuthSession).start({
      user: { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
      token: 'signed-token',
    });
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

  it('should show the level of each pollution, colored by danger', () => {
    const badges = Array.from(fixture.nativeElement.querySelectorAll('.level') as NodeListOf<HTMLElement>);

    expect(badges.map((badge) => badge.textContent!.trim())).toEqual(['Faible', 'Élevée']);
    expect(badges.map((badge) => badge.style.backgroundColor)).toEqual(['var(--level-low)', 'var(--level-high)']);
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

  it('should hide a deleted pollution at once, and delete it once the undo delay is over', async () => {
    api.delete.mockReturnValue(of(undefined));

    component.remove(PLASTIC);
    await fixture.whenStable();

    expect(labels()).toEqual(['Fumée']);
    expect(api.delete).not.toHaveBeenCalled();

    TestBed.inject(PollutionDeletion).commit();
    await fixture.whenStable();

    expect(api.delete).toHaveBeenCalledWith(PLASTIC.id);
    expect(labels()).toEqual(['Fumée']);
  });

  it('should show the pollution again when the deletion is undone', async () => {
    component.remove(PLASTIC);
    TestBed.inject(PollutionDeletion).undo();
    await fixture.whenStable();

    expect(labels()).toEqual(['Bouteilles', 'Fumée']);
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('should filter by the period picked on the timeline', async () => {
    component.setPeriod({ from: '2026-09-13', to: '' });
    await fixture.whenStable();

    expect(component.filterForm.controls.from.value).toBe('2026-09-13');
    expect(labels()).toEqual([]);
  });

  it('should switch the map to the heat view', async () => {
    const heat = fixture.nativeElement.querySelector('[aria-label="Carte de chaleur"]') as HTMLButtonElement;

    heat.click();
    await fixture.whenStable();

    expect(maps[0].setView).toHaveBeenLastCalledWith(MapView.Heat);
    expect(heat.getAttribute('aria-pressed')).toBe('true');
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

  it('should put forward the dot of the hovered row', async () => {
    const row = fixture.nativeElement.querySelector('.item') as HTMLElement;

    row.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();

    expect(maps[0].highlight).toHaveBeenLastCalledWith(PLASTIC.id);
    expect(row.classList).toContain('is-highlighted');
  });

  it('should highlight the row of the hovered dot', async () => {
    maps[0].options.onPointHover!(AIR.id);
    await fixture.whenStable();

    const highlighted = fixture.nativeElement.querySelector('.item.is-highlighted .item-label');
    expect(highlighted.textContent.trim()).toBe(AIR.label);
  });

  it('should open the detail of a clicked dot', async () => {
    maps[0].options.onPointClick!(AIR.id);
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe(`/pollutions/${AIR.id}`);
  });
});
