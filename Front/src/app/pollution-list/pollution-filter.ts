import { Pollution } from '../../interfaces/Pollution';

/** Criteria narrowing the pollution list. Empty values match everything. */
export interface PollutionFilter {
  /** Searched in label, place and description, case-insensitive. */
  text: string;
  typeId: number | null;
  /** Inclusive lower bound, `yyyy-MM-dd`. */
  from: string;
  /** Inclusive upper bound, `yyyy-MM-dd`. */
  to: string;
}

const ISO_DATE_LENGTH = 'yyyy-MM-dd'.length;

/** @returns true when the pollution meets every criterion of the filter. */
export function matches(pollution: Pollution, filter: PollutionFilter): boolean {
  const text = filter.text.trim().toLowerCase();
  const fields = [pollution.label, pollution.place, pollution.description];
  if (text && !fields.some((field) => field.toLowerCase().includes(text))) {
    return false;
  }

  if (filter.typeId !== null && pollution.type.id !== filter.typeId) {
    return false;
  }

  // ISO dates compare chronologically as strings.
  const day = pollution.date.slice(0, ISO_DATE_LENGTH);
  if (filter.from && day < filter.from) {
    return false;
  }

  if (filter.to && day > filter.to) {
    return false;
  }

  return true;
}
