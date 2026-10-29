import { Service, signal } from '@angular/core';
import { ListView } from '../interfaces/ListView';

const STORAGE_KEY = 'pollutions.view';

/** Layout chosen for the pollution results, kept in sessionStorage until the tab is closed. */
@Service()
export class ListViewPreference {
  private readonly current = signal(readStoredView());

  readonly view = this.current.asReadonly();

  set(view: ListView) {
    sessionStorage.setItem(STORAGE_KEY, view);
    this.current.set(view);
  }
}

function readStoredView(): ListView {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return Object.values(ListView).find((v) => v === stored) ?? ListView.List;
}
