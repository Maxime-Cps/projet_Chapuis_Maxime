import { paddingBeside } from './map-padding';

describe('paddingBeside', () => {
  const MAP = { left: 0, right: 1000 };

  it('should hide the right side under a panel on the right', () => {
    expect(paddingBeside(MAP, { left: 600, right: 980 })).toEqual({ left: 0, right: 424 });
  });

  it('should hide the left side under a panel on the left', () => {
    expect(paddingBeside(MAP, { left: 20, right: 400 })).toEqual({ left: 424, right: 0 });
  });

  it('should hide nothing under a panel across the middle', () => {
    expect(paddingBeside(MAP, { left: 0, right: 1000 })).toEqual({ left: 0, right: 0 });
  });
});
