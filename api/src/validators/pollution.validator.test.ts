import { test } from "node:test";
import assert from "node:assert/strict";
import { readPollution } from "./pollution.validator";

// Body as sent by the front form: <input type="number"> yields numeric coordinates
const FORM_BODY = {
  label: "Sacs plastiques",
  type: { id: 0, name: "Plastique" },
  description: "Près de l'écluse",
  date: "2026-10-29T10:00",
  place: "Canal Saint-Martin, Paris",
  latitude: 48.871,
  longitude: 2.365,
  image: "",
  dangerLevel: 42
};

test("accepts numeric coordinates from the front form", () => {
  const pollution = readPollution(FORM_BODY);

  assert.ok(pollution);
  assert.equal(pollution.latitude, "48.871");
  assert.equal(pollution.longitude, "2.365");
});

test("accepts string coordinates", () => {
  const pollution = readPollution({ ...FORM_BODY, latitude: "48.871", longitude: "2.365" });

  assert.equal(pollution?.latitude, "48.871");
});

test("rejects missing coordinates", () => {
  assert.equal(readPollution({ ...FORM_BODY, latitude: null }), null);
});

test("defaults a null image to an empty string", () => {
  assert.equal(readPollution({ ...FORM_BODY, image: null })?.image, "");
});

test("reads the danger level", () => {
  assert.equal(readPollution(FORM_BODY)?.dangerLevel, 42);
});

test("rejects a missing, negative or decimal danger level", () => {
  assert.equal(readPollution({ ...FORM_BODY, dangerLevel: undefined }), null);
  assert.equal(readPollution({ ...FORM_BODY, dangerLevel: -1 }), null);
  assert.equal(readPollution({ ...FORM_BODY, dangerLevel: 12.5 }), null);
  assert.equal(readPollution({ ...FORM_BODY, dangerLevel: "42" }), null);
});

test("rejects a danger level beyond the INTEGER column", () => {
  assert.equal(readPollution({ ...FORM_BODY, dangerLevel: 2_147_483_647 })?.dangerLevel, 2_147_483_647);
  assert.equal(readPollution({ ...FORM_BODY, dangerLevel: 2_147_483_648 }), null);
});
