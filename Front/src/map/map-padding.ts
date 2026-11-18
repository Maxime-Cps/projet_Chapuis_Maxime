import { MapPadding } from './city-map';

/** Space kept between the visible map area and the overlay, in pixels. */
const OVERLAY_GAP = 24;

const NO_PADDING: MapPadding = { left: 0, right: 0 };

type Box = Pick<DOMRect, 'left' | 'right'>;

/**
 * Hides from the camera the side of the map an overlay sits on.
 * An overlay across the middle (e.g. a full-width panel on mobile) hides nothing.
 *
 * @example padding beside a panel from x=600 on a map from 0 to 1000 -> { left: 0, right: 424 }
 */
export function paddingBeside(map: Box, overlay: Box): MapPadding {
  const middle = (map.left + map.right) / 2;

  if (overlay.left >= middle) {
    return { ...NO_PADDING, right: Math.max(0, map.right - overlay.left + OVERLAY_GAP) };
  }

  if (overlay.right <= middle) {
    return { ...NO_PADDING, left: Math.max(0, overlay.right - map.left + OVERLAY_GAP) };
  }

  return NO_PADDING;
}
