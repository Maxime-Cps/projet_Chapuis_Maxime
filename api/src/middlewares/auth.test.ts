import { test } from "node:test";
import assert from "node:assert/strict";
import { Request, Response } from "express";
import { requireAuth } from "./auth";
import { issueToken } from "../utils/token";

const UNAUTHORIZED = 401;

/** Minimal Express doubles recording what the middleware did. */
function call(authorization?: string) {
  const req = { headers: { authorization } } as Request;
  const result = { status: 0, nextCalled: false, locals: {} as Record<string, unknown> };
  const res = {
    locals: result.locals,
    status(code: number) {
      result.status = code;
      return this;
    },
    json() {
      return this;
    }
  } as unknown as Response;

  requireAuth(req, res, () => {
    result.nextCalled = true;
  });

  return result;
}

test("rejects a request without token", () => {
  const result = call();

  assert.equal(result.status, UNAUTHORIZED);
  assert.equal(result.nextCalled, false);
});

test("rejects an invalid token", () => {
  const result = call("Bearer forged.0.sig");

  assert.equal(result.status, UNAUTHORIZED);
  assert.equal(result.nextCalled, false);
});

test("lets a valid token through with its user id", () => {
  const result = call(`Bearer ${issueToken(3)}`);

  assert.equal(result.nextCalled, true);
  assert.equal(result.locals.userId, 3);
});
