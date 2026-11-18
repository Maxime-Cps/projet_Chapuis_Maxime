import { CityMap } from './city-map';
import { paddingBeside } from './map-padding';

/**
 * Keeps the camera of `map` clear of `overlay` (e.g. a panel drawn over it), following both sizes.
 *
 * @returns a function that stops following.
 * @example onCleanup(keepClearOf(map, host, panel));
 */
export function keepClearOf(map: CityMap, host: HTMLElement, overlay: HTMLElement): () => void {
  const update = () => map.setPadding(paddingBeside(host.getBoundingClientRect(), overlay.getBoundingClientRect()));
  update();

  const observer = new ResizeObserver(update);
  observer.observe(host);
  observer.observe(overlay);
  return () => observer.disconnect();
}
