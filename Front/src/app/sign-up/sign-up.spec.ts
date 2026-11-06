import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { SignUp } from './sign-up';
import { UserApi } from '../../services/user-api';
import { AuthSession } from '../../services/auth-session';
import { User } from '../../interfaces/User';
import { Session } from '../../interfaces/Session';
import { routes } from '../app.routes';

describe('SignUp', () => {
  const USER: User = { id: 7, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
  const SESSION: Session = { user: USER, token: 'signed-token' };

  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let api: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sessionStorage.clear();
    api = { create: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        provideRouter(routes),
        { provide: UserApi, useValue: api },
      ],
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

    expect(api.create).not.toHaveBeenCalled();
  });

  it('should disable the submit button while the request is pending', async () => {
    api.create.mockReturnValue(new Subject<Session>());
    fillForm();

    component.onSubmit();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button[type=submit]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should open the pollution list once the account is created', async () => {
    api.create.mockReturnValue(of(SESSION));
    fillForm();

    component.onSubmit();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/pollutions');
  });

  it('should start the session returned by account creation', async () => {
    api.create.mockReturnValue(of(SESSION));
    fillForm();

    component.onSubmit();

    expect(TestBed.inject(AuthSession).token()).toBe(SESSION.token);
  });

  it('should display an error when the email is taken', async () => {
    api.create.mockReturnValue(
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
