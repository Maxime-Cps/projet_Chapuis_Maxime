import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { UserApi } from '../../services/user-api';
import { AuthApi } from '../../services/auth-api';
import { AuthSession } from '../../services/auth-session';
import { SignUpRequest } from '../../interfaces/SignUpRequest';
import { LINKS } from '../../constants/routes';
import { SIGN_UP_ERRORS } from '../../constants/messages';

const PASSWORD_MIN_LENGTH = 8;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-sign-up',
  styleUrl: './sign-up.scss',
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly api = inject(UserApi);
  private readonly auth = inject(AuthApi);
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  readonly links = LINKS;
  readonly passwordMinLength = PASSWORD_MIN_LENGTH;
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
    }),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);

    const request: SignUpRequest = this.form.getRawValue();
    this.saving.set(true);
    const { email, password } = request;
    this.api
      .create(request)
      .pipe(
        // The account exists: log in to get a session token
        switchMap(() => this.auth.login({ email, password })),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (session) => {
          this.session.start(session);
          this.router.navigateByUrl(LINKS.list);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(errorMessage(err));
        },
      });
  }
}

function errorMessage(err: HttpErrorResponse): string {
  if (err.status === HttpStatusCode.Conflict) {
    return SIGN_UP_ERRORS.emailTaken;
  }

  if (err.status === 0) {
    return SIGN_UP_ERRORS.unreachable;
  }

  return SIGN_UP_ERRORS.generic;
}
