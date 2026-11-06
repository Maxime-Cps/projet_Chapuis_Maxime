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
  image: ""
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
