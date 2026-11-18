import { fitWithin, isImageFile } from './image-file';

describe('fitWithin', () => {
  it('should shrink the longest side to the limit, keeping the ratio', () => {
    expect(fitWithin({ width: 4000, height: 3000 }, 1280)).toEqual({ width: 1280, height: 960 });
    expect(fitWithin({ width: 1000, height: 2000 }, 1280)).toEqual({ width: 640, height: 1280 });
  });

  it('should never enlarge a small image', () => {
    expect(fitWithin({ width: 300, height: 200 }, 1280)).toEqual({ width: 300, height: 200 });
  });
});

describe('isImageFile', () => {
  it('should tell images from other files by their type', () => {
    expect(isImageFile(new File([], 'a.png', { type: 'image/png' }))).toBe(true);
    expect(isImageFile(new File([], 'a.pdf', { type: 'application/pdf' }))).toBe(false);
  });
});
