import { computed, Service, signal } from '@angular/core';
import { Session } from '../interfaces/Session';

const STORAGE_KEY = 'auth.session';

/**
 * Signed-in user and API token, kept in sessionStorage so a reload keeps
 * the session until the tab is closed.
 */
@Service()
export class AuthSession {
  private readonly current = signal<Session | null>(readStoredSession());

  readonly user = computed(() => this.current()?.user ?? null);
  readonly token = computed(() => this.current()?.token ?? null);
  readonly isSignedIn = computed(() => this.current() !== null);

  start(session: Session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.current.set(session);
  }

  end() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.current.set(null);
  }
}

function readStoredSession(): Session | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return null;
  }

  try {
    const session = JSON.parse(stored) as Partial<Session> | null;
    const valid = typeof session?.token === 'string' && typeof session.user?.email === 'string';
    return valid ? (session as Session) : null;
  } catch {
    return null;
  }
}
