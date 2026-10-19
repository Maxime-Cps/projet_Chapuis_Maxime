import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { PollutionForm } from './pollution-form';
import { mockPollutionInterceptor } from '../../services/mock-pollution.interceptor';

describe('PollutionForm', () => {
  let component: PollutionForm;
  let fixture: ComponentFixture<PollutionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionForm],
      providers: [provideHttpClient(withInterceptors([mockPollutionInterceptor])), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
