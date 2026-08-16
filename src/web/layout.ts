/** Wide enough for a side-rail temple, not a stretched phone. */
export const TEMPLE_MIN_WIDTH = 1100;

export function isTempleWidth(width: number): boolean {
  return width >= TEMPLE_MIN_WIDTH;
}
