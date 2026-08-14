import type { WindowKind } from '../motion/types';
import type { SkyState } from '../engine';

/**
 * Map the engine's current slot name onto a motion tint.
 * Does not read or invent clocks — names only.
 */
export function windowKindFromSky(sky: SkyState): WindowKind {
  const name = sky.currentSlot.name.toLowerCase();
  if (name.includes('rahu')) return 'rahu';
  if (name.includes('yamaganda') || name.includes('yama')) return 'yamaganda';
  if (name.includes('gulika')) return 'gulika';
  if (name.includes('abhijit')) return 'abhijit';
  if (name.includes('labh')) return 'labh';
  if (name.includes('amrit')) return 'amrit';
  if (name.includes('shubh')) return 'shubh';
  return 'other';
}
