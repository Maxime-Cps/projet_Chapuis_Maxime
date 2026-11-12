import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { Server } from "node:http";
import express from "express";
import initRoutes from ".";
import { issueToken } from "../utils/token";

// The test database URL points to a closed port: any request reaching the database fails with 500.
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;

let server: Server;
let baseUrl: string;

before(async () => {
  const app = express();
  app.use(express.json());
  initRoutes(app);

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

after(() => {
  server.close();
});

const AUTH = { Authorization: `Bearer ${issueToken(1)}` };

function postUser(body: object) {
  return fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

test("rejects pollution requests without a token", async () => {
  const list = await fetch(`${baseUrl}/pollutions`);
  const removal = await fetch(`${baseUrl}/pollutions/1`, { method: "DELETE" });

  assert.equal(list.status, UNAUTHORIZED);
  assert.equal(removal.status, UNAUTHORIZED);
});

test("answers 404 for a non-numeric pollution id", async () => {
  const response = await fetch(`${baseUrl}/pollutions/abc`, { headers: AUTH });

  assert.equal(response.status, NOT_FOUND);
});

test("rejects a user whose password is too short", async () => {
  const response = await postUser({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", password: "a" });

  assert.equal(response.status, BAD_REQUEST);
});

test("rejects a user with a malformed email", async () => {
  const response = await postUser({ firstName: "Ada", lastName: "Lovelace", email: "toto", password: "secret123" });

  assert.equal(response.status, BAD_REQUEST);
});
