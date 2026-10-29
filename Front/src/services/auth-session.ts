import { computed, Service, signal } from '@angular/core';
import { User } from '../interfaces/User';

const STORAGE_KEY = 'auth.user';

/**
 * Signed-in user, kept in sessionStorage so a reload keeps the session
 * until the tab is closed.
 */
@Service()
export class AuthSession {
  private readonly current = signal<User | null>(readStoredUser());

  readonly user = this.current.asReadonly();
  readonly isSignedIn = computed(() => this.current() !== null);

  start(user: User) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.current.set(user);
  }

  end() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.current.set(null);
  }
}

function readStoredUser(): User | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return null;
  }

  try {
    const user = JSON.parse(stored) as Partial<User> | null;
    return typeof user?.email === 'string' ? (user as User) : null;
  } catch {
    return null;
  }
}
