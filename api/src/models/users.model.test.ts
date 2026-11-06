import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeEmail } from "./users.model";

test("lowercases and trims an email", () => {
  assert.equal(normalizeEmail("  Ada@Example.COM "), "ada@example.com");
});
