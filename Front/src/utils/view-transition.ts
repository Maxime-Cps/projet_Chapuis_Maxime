/**
 * View transition name shared by a report's row in the list and its detail panel,
 * so the browser morphs one into the other.
 *
 * @example reportTransition(3) -> 'report-3'
 */
export function reportTransition(id: number): string {
  return `report-${id}`;
}
