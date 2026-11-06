import { TestBed } from '@angular/core/testing';
import { AuthSession } from './auth-session';
import { Session } from '../interfaces/Session';

describe('AuthSession', () => {
  const SESSION: Session = {
    user: { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
    token: 'signed-token',
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should start signed out', () => {
    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
  });

  it('should restore a started session after a reload', () => {
    TestBed.inject(AuthSession).start(SESSION);

    TestBed.resetTestingModule();

    const restored = TestBed.inject(AuthSession);
    expect(restored.user()).toEqual(SESSION.user);
    expect(restored.token()).toBe(SESSION.token);
  });

  it('should ignore a malformed stored session', () => {
    sessionStorage.setItem('auth.session', '{}');

    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
  });

  it('should ignore a stored session without token', () => {
    sessionStorage.setItem('auth.session', JSON.stringify({ user: SESSION.user }));

    expect(TestBed.inject(AuthSession).isSignedIn()).toBe(false);
  });

  it('should forget the user once ended', () => {
    const session = TestBed.inject(AuthSession);
    session.start(SESSION);

    session.end();

    expect(session.isSignedIn()).toBe(false);
    expect(sessionStorage.length).toBe(0);
  });
});
