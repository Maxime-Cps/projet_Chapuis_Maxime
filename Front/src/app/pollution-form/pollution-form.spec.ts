import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { PollutionForm } from './pollution-form';
import { PollutionApi } from '../../services/pollution-api';
import { routes } from '../app.routes';
import { SignUp } from '../sign-up/sign-up';
import { AuthSession } from '../../services/auth-session';

describe('PollutionForm', () => {
  let component: PollutionForm;
  let fixture: ComponentFixture<PollutionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    }).compileComponents();

    TestBed.inject(AuthSession).start({
      user: { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
      token: 'signed-token',
    });
    fixture = TestBed.createComponent(PollutionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button while saving', async () => {
    component.form.setValue({
      label: 'Bouteilles',
      type: component.pollutionTypeList[0],
      description: 'Sous le pont',
      date: '2026-01-01T10:00',
      place: 'Paris',
      latitude: 48.85,
      longitude: 2.34,
      image: '',
      dangerLevel: 42,
    });

    component.onSubmit();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type=submit]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    const req = TestBed.inject(HttpTestingController).expectOne(PollutionApi.URL);
    req.flush({ ...req.request.body, id: 1 });
    expect(component.isSubmitted()).toBe(true);
  });

  it('should sign out and go to the sign-up page', async () => {
    const router = TestBed.inject(Router);
    const button = fixture.nativeElement.querySelector('app-sign-out button') as HTMLButtonElement;

    button.click();
    await fixture.whenStable();

    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
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

  describe('with a decimal danger level', () => {
    beforeEach(async () => {
      const dangerLevel = component.form.controls['dangerLevel'];
      dangerLevel.setValue(12.5);
      dangerLevel.markAsTouched();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should invalidate the danger level', () => {
      expect(component.form.controls['dangerLevel'].hasError('pattern')).toBe(true);
    });

    it('should show an error under the danger level field', () => {
      const hint = fixture.nativeElement.querySelector('#danger-level-hint') as HTMLElement | null;

      expect(hint?.textContent).toContain('entier');
    });
  });
});
