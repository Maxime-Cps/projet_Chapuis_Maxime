import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AuthRedirect } from '../services/auth-redirect';
import { UnsavedChanges } from '../interfaces/UnsavedChanges';
import { ID_PARAM, LINKS } from '../constants/routes';
import { LEAVE_CONFIRMATION } from '../constants/messages';

/** Ids the API assigns: 1, 2, 3… */
const POSITIVE_INTEGER = /^[1-9]\d*$/;

/** Sends URLs with a malformed pollution id (e.g. `/pollutions/abc`) to the pollution list. */
export const pollutionIdGuard: CanActivateFn = (route) => {
  const id = route.paramMap.get(ID_PARAM) ?? '';
  return POSITIVE_INTEGER.test(id) || inject(Router).parseUrl(LINKS.list);
};

/**
 * Asks before leaving a page with unsaved edits.
 * Lets through when the API rejected the session: the edits could not be saved anyway.
 */
export const unsavedChangesGuard: CanDeactivateFn<UnsavedChanges> = (page) => {
  if (!page.hasUnsavedChanges() || inject(AuthRedirect).isExpiring()) {
    return true;
  }

  return confirm(LEAVE_CONFIRMATION);
};
