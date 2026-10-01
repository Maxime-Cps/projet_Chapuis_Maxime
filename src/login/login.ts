import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface User {
  login: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  email: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  protected user : User = {
    login: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    email: '',
  };

  /** True when the confirmation differs from the password. */
  protected passwordsDiffer(): boolean {
    return this.user.password !== this.user.confirmPassword;
  }

  protected submit(form: NgForm): void {
    if (form.invalid || this.passwordsDiffer()) {
      form.control.markAllAsTouched();
      return;
    }

    console.log(this.user);
  }
}
