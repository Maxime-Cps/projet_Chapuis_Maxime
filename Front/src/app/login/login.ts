import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApi } from '../../services/auth-api';
import { AuthSession } from '../../services/auth-session';
import { LoginRequest } from '../../interfaces/LoginRequest';
import { LINKS } from '../../constants/routes';
import { LOGIN_ERRORS } from '../../constants/messages';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: '../sign-up/sign-up.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly api = inject(AuthApi);
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  readonly links = LINKS;
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);

    const request: LoginRequest = this.form.getRawValue();
    this.saving.set(true);
    this.api.login(request).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (user) => {
        this.session.start(user);
        this.router.navigateByUrl(LINKS.list);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(errorMessage(err));
      },
    });
  }
}

function errorMessage(err: HttpErrorResponse): string {
  if (err.status === HttpStatusCode.Unauthorized) {
    return LOGIN_ERRORS.invalid;
  }

  if (err.status === 0) {
    return LOGIN_ERRORS.unreachable;
  }

  return LOGIN_ERRORS.generic;
}
