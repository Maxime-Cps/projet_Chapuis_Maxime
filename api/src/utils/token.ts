import { createHmac, timingSafeEqual } from "node:crypto";
import { AUTH_SECRET } from "../config";

if (!AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET environment variable (see .env.example).");
}

/** How long a token stays valid after login: 12 hours. */
export const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
}

/**
 * Stateless session token "<userId>.<expiresAt ms>.<HMAC signature>".
 *
 * @example issueToken(3) -> "3.1793986183742.Xk9..."
 */
export function issueToken(userId: number, now = Date.now()): string {
  const payload = `${userId}.${now + TOKEN_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

/** User id carried by a token, or null when it is forged, malformed or expired. */
export function readToken(token: string, now = Date.now()): number | null {
  const [userId, expiresAt, signature, ...rest] = token.split(".");
  if (!userId || !expiresAt || !signature || rest.length > 0) {
    return null;
  }

  const expected = Buffer.from(sign(`${userId}.${expiresAt}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  if (Number(expiresAt) < now) {
    return null;
  }

  const id = Number(userId);
  return Number.isInteger(id) ? id : null;
}
