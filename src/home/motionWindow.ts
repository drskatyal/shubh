import type { WindowKind as EngineWindow } from '../engine';
import type { Verdict, WindowKind as MotionWindow } from '../motion';

const MOTION_WINDOWS = new Set<MotionWindow>([
  'rahu',
  'yamaganda',
  'gulika',
  'abhijit',
  'labh',
  'amrit',
  'shubh',
]);

/** Map engine slot names onto the motion palette. Chal / Udveg / Kaal / Rog → other. */
export function toMotionWindow(name: EngineWindow): MotionWindow {
  return MOTION_WINDOWS.has(name as MotionWindow) ? (name as MotionWindow) : 'other';
}

export function toMotionVerdict(state: 'now' | 'wait'): Verdict {
  return state;
}
