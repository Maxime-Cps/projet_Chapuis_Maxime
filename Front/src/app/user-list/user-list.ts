import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { UserApi } from '../../services/user-api';
import { AuthSession } from '../../services/auth-session';
import { User } from '../../interfaces/User';
import { LINKS } from '../../constants/routes';
import { USER_ERRORS } from '../../constants/messages';
import { Icon } from '../icon/icon';
import { SignOut } from '../sign-out/sign-out';

/** Registered users, loaded from the users API. */
@Component({
  imports: [RouterLink, Icon, SignOut],
  selector: 'app-user-list',
  styleUrl: './user-list.scss',
  templateUrl: './user-list.html',
})
export class UserList {
  private readonly api = inject(UserApi);

  readonly links = LINKS;
  readonly currentUser = inject(AuthSession).user;
  readonly users = signal<User[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.api.getAll().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set(USER_ERRORS.listLoad),
    });
  }
}
