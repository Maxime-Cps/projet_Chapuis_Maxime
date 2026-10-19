import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { SignUpRequest } from '../../interfaces/SignUpRequest';
import { User } from '../../interfaces/User';
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
  private readonly api = inject(Api);

  readonly links = LINKS;
  readonly passwordMinLength = PASSWORD_MIN_LENGTH;
  readonly user = signal<User | null>(null);
  readonly error = signal<string | null>(null);

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
    this.api.signUp(request).subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(errorMessage(err));
      },
    });
  }

  restart() {
    this.form.reset();
    this.user.set(null);
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
