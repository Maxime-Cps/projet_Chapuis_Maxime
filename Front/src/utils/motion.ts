/** Whether the user asked the system to reduce motion. False where it cannot be known, e.g. jsdom. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fast start, soft landing: 0 -> 0, 0.5 -> 0.875, 1 -> 1. */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
