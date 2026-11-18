/**
 * Longest side of a stored image, in pixels: enough for the detail photo (26 rem wide).
 * Kept small because the list response carries every image.
 */
const MAX_SIDE = 960;

/** JPEG quality of a stored image, from 0 to 1. */
const JPEG_QUALITY = 0.72;

const JPEG = 'image/jpeg';

/** Size of an image, in pixels. */
export interface Size {
  width: number;
  height: number;
}

/**
 * Shrinks a size to fit a square of `max` pixels, keeping its ratio. Never enlarges.
 *
 * @example fitWithin({ width: 4000, height: 3000 }, 1280) -> { width: 1280, height: 960 }
 */
export function fitWithin(size: Size, max: number): Size {
  const scale = Math.min(1, max / Math.max(size.width, size.height));
  return { width: Math.round(size.width * scale), height: Math.round(size.height * scale) };
}

/** Whether a file is an image, from its type, e.g. `image/png`. */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Reads an image file into a JPEG data URL, shrunk to {@link MAX_SIDE}, so the API stores it
 * as text with the report. Rejects files the browser cannot decode.
 */
export async function toStoredImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap, MAX_SIDE);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL(JPEG, JPEG_QUALITY);
}
