import { DestroyRef, inject, Service, signal } from '@angular/core';
import { PollutionApi } from './pollution-api';
import { Pollution } from '../interfaces/Pollution';
import { POLLUTION_ERRORS } from '../constants/messages';

/** Time left to undo a deletion, in ms. */
export const UNDO_DELAY_MS = 5000;

/**
 * Deletes reports after a delay during which the deletion can be undone.
 * Reports pending or deleted are listed in `hiddenIds`, so pages leave them out.
 *
 *   schedule ──5 s──> API delete ──ok──> stays hidden
 *      │                         └─fail─> shown again, `error` set
 *      └─ undo ─> shown again, nothing sent
 *
 * One deletion waits at a time: scheduling another sends the previous one at once.
 */
@Service()
export class PollutionDeletion {
  private readonly api = inject(PollutionApi);
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** Report waiting to be deleted, null when none. */
  readonly pending = signal<Pollution | null>(null);

  /** Ids of the reports pending or deleted. */
  readonly hiddenIds = signal<ReadonlySet<number>>(new Set());

  /** Message of the last failed deletion, null when none. */
  readonly error = signal<string | null>(null);

  constructor() {
    // Leaving the page sends the pending deletion (a keepalive request) rather than losing it
    const leave = () => this.commit();
    addEventListener('pagehide', leave);
    inject(DestroyRef).onDestroy(() => removeEventListener('pagehide', leave));
  }

  schedule(pollution: Pollution) {
    this.commit();
    this.error.set(null);
    this.pending.set(pollution);
    this.hide(pollution.id);
    this.timer = setTimeout(() => this.commit(), UNDO_DELAY_MS);
  }

  undo() {
    const pollution = this.pending();
    if (!pollution) {
      return;
    }

    clearTimeout(this.timer);
    this.pending.set(null);
    this.show(pollution.id);
  }

  /** Sends the pending deletion now. */
  commit() {
    const pollution = this.pending();
    if (!pollution) {
      return;
    }

    clearTimeout(this.timer);
    this.pending.set(null);
    this.api.delete(pollution.id).subscribe({
      error: () => {
        this.show(pollution.id);
        this.error.set(POLLUTION_ERRORS.delete);
      },
    });
  }

  private hide(id: number) {
    this.hiddenIds.update((ids) => new Set(ids).add(id));
  }

  private show(id: number) {
    this.hiddenIds.update((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }
}
