import { test } from "node:test";
import assert from "node:assert/strict";
import { findByPassword, hashPassword } from "./password";

test("picks the account whose password matches among case-duplicate emails", async () => {
  const accounts = [
    { id: 1, passwordHash: await hashPassword("first-secret") },
    { id: 2, passwordHash: await hashPassword("second-secret") }
  ];

  assert.equal((await findByPassword(accounts, "second-secret"))?.id, 2);
});

test("returns null when no account matches the password", async () => {
  const accounts = [{ id: 1, passwordHash: await hashPassword("first-secret") }];

  assert.equal(await findByPassword(accounts, "wrong"), null);
});
