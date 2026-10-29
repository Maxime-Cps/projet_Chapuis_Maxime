import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { PollutionForm } from './pollution-form';
import { mockPollutionInterceptor } from '../../services/mock-pollution.interceptor';
import { routes } from '../app.routes';
import { SignUp } from '../sign-up/sign-up';

describe('PollutionForm', () => {
  let component: PollutionForm;
  let fixture: ComponentFixture<PollutionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionForm],
      providers: [provideHttpClient(withInterceptors([mockPollutionInterceptor])), provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button while saving', async () => {
    vi.useFakeTimers();
    component.form.setValue({
      label: 'Bouteilles',
      type: component.pollutionTypeList[0],
      description: 'Sous le pont',
      date: '2026-01-01T10:00',
      place: 'Paris',
      latitude: 48.85,
      longitude: 2.34,
      image: '',
    });

    component.onSubmit();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type=submit]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await vi.runAllTimersAsync();
    vi.useRealTimers();
    expect(component.isSubmitted()).toBe(true);
  });

  it('should link to the sign-up page', async () => {
    const router = TestBed.inject(Router);
    const link = fixture.nativeElement.querySelector('#sign-up-link') as HTMLAnchorElement | null;

    await router.navigateByUrl(link?.getAttribute('href') ?? '');

    expect(router.routerState.snapshot.root.firstChild?.component).toBe(SignUp);
  });

  describe('with a future observation date', () => {
    const FUTURE_DATE = '2999-01-01T10:00';

    beforeEach(async () => {
      const date = component.form.controls['date'];
      date.setValue(FUTURE_DATE);
      date.markAsTouched();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should invalidate the date', () => {
      expect(component.form.controls['date'].hasError('future')).toBe(true);
    });

    it('should show an error under the date field', () => {
      const hint = fixture.nativeElement.querySelector('#date-hint') as HTMLElement | null;

      expect(hint?.textContent).toContain('futur');
    });
  });
});
