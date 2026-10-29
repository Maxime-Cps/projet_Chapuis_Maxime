import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthApi } from '../../services/auth-api';
import { AuthSession } from '../../services/auth-session';
import { User } from '../../interfaces/User';
import { routes } from '../app.routes';

describe('Login', () => {
  const USER: User = { id: 7, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };

  let component: Login;
  let fixture: ComponentFixture<Login>;
  let api: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sessionStorage.clear();
    api = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter(routes), { provide: AuthApi, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function fillForm() {
    component.form.setValue({ email: 'ada@example.com', password: 'secret123' });
  }

  it('should not call the API when the form is invalid', () => {
    component.onSubmit();

    expect(api.login).not.toHaveBeenCalled();
  });

  it('should sign the user in and open the pollution list', async () => {
    api.login.mockReturnValue(of(USER));
    fillForm();

    component.onSubmit();
    await fixture.whenStable();

    expect(TestBed.inject(AuthSession).user()).toEqual(USER);
    expect(TestBed.inject(Router).url).toBe('/pollutions');
  });

  it('should display an error on wrong credentials', async () => {
    api.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: HttpStatusCode.Unauthorized })),
    );
    fillForm();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const error = fixture.nativeElement.querySelector('#login-error') as HTMLElement | null;
    expect(error?.textContent).toContain('incorrect');
    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
  });
});
