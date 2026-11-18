import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { unsavedChangesGuard } from './pollution.guards';
import { AuthRedirect } from '../services/auth-redirect';

describe('unsavedChangesGuard', () => {
  const CURRENT_ROUTE = {} as ActivatedRouteSnapshot;
  const CURRENT_STATE = {} as RouterStateSnapshot;

  let confirm: ReturnType<typeof vi.spyOn>;
  let expiring: boolean;

  beforeEach(() => {
    expiring = false;
    confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthRedirect, useValue: { isExpiring: () => expiring } }],
    });
  });

  afterEach(() => confirm.mockRestore());

  function leave(hasUnsavedChanges: boolean) {
    const page = { hasUnsavedChanges: () => hasUnsavedChanges };
    return TestBed.runInInjectionContext(() => unsavedChangesGuard(page, CURRENT_ROUTE, CURRENT_STATE, CURRENT_STATE));
  }

  it('should let the user leave a page without changes', () => {
    expect(leave(false)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('should keep the user on the page when they cancel', () => {
    expect(leave(true)).toBe(false);
    expect(confirm).toHaveBeenCalled();
  });

  it('should let the user leave when the API rejected the session', () => {
    expiring = true;

    expect(leave(true)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });
});
