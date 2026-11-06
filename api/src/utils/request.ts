/** True when the value is a non-blank string. */
export function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Readable message of a caught error. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
