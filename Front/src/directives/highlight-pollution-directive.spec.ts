import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightPollutionDirective } from './highlight-pollution-directive';

@Component({
  imports: [HighlightPollutionDirective],
  template: `<span [appHighlightPollution]="index()"></span>`,
})
class Host {
  readonly index = signal<number | null>(0);
}

describe('HighlightPollutionDirective', () => {
  const CASES: [number | null, string][] = [
    [10, 'var(--level-low)'],
    [35, 'var(--level-moderate)'],
    [80, 'var(--level-high)'],
    [150, 'var(--level-dangerous)'],
    [null, 'var(--muted)'],
  ];

  for (const [index, color] of CASES) {
    it(`should paint ${index} with ${color}`, async () => {
      const fixture = TestBed.createComponent(Host);
      fixture.componentInstance.index.set(index);
      await fixture.whenStable();

      const span = fixture.nativeElement.querySelector('span') as HTMLElement;
      expect(span.style.backgroundColor).toBe(color);
    });
  }
});
