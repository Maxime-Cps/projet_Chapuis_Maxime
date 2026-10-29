import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** Hashes a password as "salt:hash" (hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${hash.toString("hex")}`;
}

/** Checks a password against a hash produced by {@link hashPassword}. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  if (expected.length !== KEY_LENGTH) {
    return false;
  }

  const actual = await scryptAsync(password, salt, KEY_LENGTH);
  return timingSafeEqual(expected, actual);
}
