import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Session } from '../interfaces/Session';

/** True when the value has the shape of a session issued by the API. */
export function isSession(value: unknown): value is Session {
  const session = value as Partial<Session> | null;
  return typeof session?.token === 'string' && typeof session.user?.email === 'string';
}

/**
 * Passes a session through, or fails like an HTTP error when the API answered something else.
 *
 * @example A static host without the /api proxy answers 200 with an empty body.
 */
export function requireSession(body: unknown): Session {
  if (isSession(body)) {
    return body;
  }

  throw new HttpErrorResponse({ status: HttpStatusCode.Ok, statusText: 'Response is not a session' });
}
