import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {User} from '../../interfaces/User';

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
