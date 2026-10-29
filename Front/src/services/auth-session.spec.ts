import { TestBed } from '@angular/core/testing';
import { AuthSession } from './auth-session';
import { User } from '../interfaces/User';

describe('AuthSession', () => {
  const USER: User = { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should start signed out', () => {
    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
  });

  it('should restore a started session after a reload', () => {
    TestBed.inject(AuthSession).start(USER);

    TestBed.resetTestingModule();

    expect(TestBed.inject(AuthSession).user()).toEqual(USER);
  });

  it('should ignore a malformed stored user', () => {
    sessionStorage.setItem('auth.user', '{}');

    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
  });

  it('should forget the user once ended', () => {
    const session = TestBed.inject(AuthSession);
    session.start(USER);

    session.end();

    expect(session.isSignedIn()).toBe(false);
    expect(sessionStorage.length).toBe(0);
  });
});
