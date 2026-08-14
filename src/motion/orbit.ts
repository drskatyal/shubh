export const SUN_PERIOD_MS = 96_000;
export const MOON_PERIOD_MS = 156_000;
export const EARTH_PERIOD_MS = 72_000;

/** Composed still: sun upper-right, moon lower-left, earth on the inner path. */
export const STILL_CLOCK_MS = 0;
export const SUN_PHASE = -0.55;
export const MOON_PHASE = 2.4;
export const EARTH_PHASE = 3.7;
export const ECLIPTIC_TILT = -0.32;

export function clockMs(elapsedMs: number, reduceMotion: boolean): number {
  'worklet';
  return reduceMotion ? STILL_CLOCK_MS : elapsedMs;
}

export function orbitalPosition(
  tMs: number,
  periodMs: number,
  rx: number,
  ry: number,
  phase: number,
): { x: number; y: number } {
  'worklet';
  const a = (tMs / periodMs) * Math.PI * 2 + phase;
  return { x: Math.cos(a) * rx, y: Math.sin(a) * ry };
}

export type Star = { x: number; y: number; r: number; a: number };

/** Deterministic field so Reduce Motion and tests share the same sky. */
export function starField(count: number): Star[] {
  const stars: Star[] = [];
  let seed = 0x51f1e11;
  for (let i = 0; i < count; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = (seed & 0xffff) / 0xffff;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = (seed & 0xffff) / 0xffff;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const r = 0.6 + ((seed & 0xff) / 0xff) * 1.1;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const a = 0.18 + ((seed & 0xff) / 0xff) * 0.42;
    stars.push({ x, y, r, a });
  }
  return stars;
}

export const STAR_COUNT = 12;
export const SCENE_BODY_NODES = 11;
export const SKIA_NODE_BUDGET = 24;
export const STARS = starField(STAR_COUNT);
