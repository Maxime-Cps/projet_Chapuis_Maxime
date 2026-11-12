import { test } from "node:test";
import assert from "node:assert/strict";
import { readNewUser } from "./users.validator";

const BODY = { firstName: "Ada", lastName: "Lovelace", email: " Ada@Example.com ", password: "secret123" };

test("accepts a valid user and normalizes the email", () => {
  assert.deepEqual(readNewUser(BODY), { ...BODY, email: "ada@example.com" });
});

test("rejects a password shorter than 8 characters", () => {
  assert.equal(readNewUser({ ...BODY, password: "short" }), null);
});

test("rejects a malformed email", () => {
  assert.equal(readNewUser({ ...BODY, email: "toto" }), null);
  assert.equal(readNewUser({ ...BODY, email: "a b@example.com" }), null);
});

test("rejects missing or blank fields", () => {
  assert.equal(readNewUser({ ...BODY, firstName: " " }), null);
  assert.equal(readNewUser({ ...BODY, lastName: undefined }), null);
  assert.equal(readNewUser(null), null);
});
