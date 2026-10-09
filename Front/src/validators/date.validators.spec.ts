import { FormControl } from '@angular/forms';
import { notInFuture } from './date.validators';

describe('notInFuture', () => {
  it('should reject a future date', () => {
    expect(notInFuture(new FormControl('2999-01-01T10:00'))).toEqual({ future: true });
  });

  it('should accept a past date', () => {
    expect(notInFuture(new FormControl('2020-01-01T10:00'))).toBeNull();
  });

  it('should ignore an empty value', () => {
    expect(notInFuture(new FormControl(''))).toBeNull();
  });
});
