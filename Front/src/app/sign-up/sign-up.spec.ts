import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { SignUp } from './sign-up';
import { Api } from '../../services/api';
import { User } from '../../interfaces/SignUpRequest';

describe('SignUp', () => {
  const USER: User = { id: 7, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };

  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let api: { signUp: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { signUp: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [{ provide: Api, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function fillForm() {
    component.form.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
    });
  }

  it('should not call the API when the form is invalid', () => {
    component.onSubmit();

    expect(api.signUp).not.toHaveBeenCalled();
  });

  it('should display the created user', async () => {
    api.signUp.mockReturnValue(of(USER));
    fillForm();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Bienvenue, Ada');
  });

  it('should display an error when the email is taken', async () => {
    api.signUp.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: HttpStatusCode.Conflict })),
    );
    fillForm();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const error = fixture.nativeElement.querySelector('#sign-up-error') as HTMLElement | null;
    expect(error?.textContent).toContain('déjà utilisé');
  });
});
