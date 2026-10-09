import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Rejects a date later than now.
 * Empty values pass: pair with `Validators.required` when needed.
 *
 * @example new FormControl('', [Validators.required, notInFuture])
 * @returns `{ future: true }` when the date is in the future, `null` otherwise.
 */
export function notInFuture(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  return new Date(control.value) > new Date() ? { future: true } : null;
}
