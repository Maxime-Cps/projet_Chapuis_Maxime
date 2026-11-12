import { test } from "node:test";
import assert from "node:assert/strict";
import { issueSession, issueToken, readToken, TOKEN_TTL_MS } from "./token";
import { UserInstance } from "../models/users.model";

const USER_ID = 42;
const NOW = Date.UTC(2026, 10, 6);

test("reads back the user id of an issued token", () => {
  assert.equal(readToken(issueToken(USER_ID, NOW), NOW), USER_ID);
});

test("rejects a token whose user id was changed", () => {
  const [, expiresAt, signature] = issueToken(USER_ID, NOW).split(".");

  assert.equal(readToken(`7.${expiresAt}.${signature}`, NOW), null);
});

test("rejects an expired token", () => {
  const token = issueToken(USER_ID, NOW);

  assert.equal(readToken(token, NOW + TOKEN_TTL_MS + 1), null);
});

test("rejects garbage", () => {
  assert.equal(readToken("not-a-token", NOW), null);
  assert.equal(readToken("", NOW), null);
});

test("issues a session with the public user and a token for its id", () => {
  const user = { id: USER_ID, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", passwordHash: "salt:hash" };

  const session = issueSession(user as UserInstance, NOW);

  assert.deepEqual(session.user, { id: USER_ID, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });
  assert.equal(readToken(session.token, NOW), USER_ID);
});
