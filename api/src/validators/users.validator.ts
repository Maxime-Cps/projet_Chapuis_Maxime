import { normalizeEmail } from "../models/users.model";
import { isText } from "../utils/request";

/** Same minimum as the front sign-up form. */
export const PASSWORD_MIN_LENGTH = 8;

/** One "@" between non-blank parts, as the front's email validator requires. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

/** Fields needed to create a user, email already normalized. */
export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Extracts a new user from a request body, or null when invalid.
 * Enforced here too, since the API can be called without the front.
 */
export function readNewUser(body: unknown): NewUser | null {
  const { firstName, lastName, email, password } = (body ?? {}) as Record<string, unknown>;
  if (![firstName, lastName, email, password].every(isText)) {
    return null;
  }

  const normalized = normalizeEmail(email as string);
  if (!EMAIL_PATTERN.test(normalized) || (password as string).length < PASSWORD_MIN_LENGTH) {
    return null;
  }

  return { firstName: firstName as string, lastName: lastName as string, email: normalized, password: password as string };
}
