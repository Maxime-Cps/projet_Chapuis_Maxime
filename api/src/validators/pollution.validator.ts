import { PollutionCreationAttributes } from "../models/pollutions.model";

const REQUIRED_TEXT_FIELDS = ["label", "description", "date", "place"] as const;

/**
 * Coordinate as text, accepting numbers since the front form sends them
 * from <input type="number"> (e.g. 48.871 -> "48.871"). Null when absent.
 */
function readCoordinate(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  return null;
}

/** Extracts the writable pollution fields from a request body, or null when invalid. */
export function readPollution(body: unknown): PollutionCreationAttributes | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const fields = body as Record<string, unknown>;
  if (REQUIRED_TEXT_FIELDS.some((key) => typeof fields[key] !== "string")) {
    return null;
  }

  const type = fields.type as Record<string, unknown> | undefined;
  if (typeof type?.id !== "number" || typeof type?.name !== "string") {
    return null;
  }

  const latitude = readCoordinate(fields.latitude);
  const longitude = readCoordinate(fields.longitude);
  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    label: fields.label as string,
    type: { id: type.id, name: type.name },
    description: fields.description as string,
    date: fields.date as string,
    place: fields.place as string,
    latitude,
    longitude,
    image: typeof fields.image === "string" ? fields.image : ""
  };
}
