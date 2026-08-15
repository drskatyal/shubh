/**
 * Screenshot routing only. Not the in-app happy path.
 * Open Expo web with ?shot=home|match|confirm|milan|muhurat|festivals|kundli|ask|paywall
 * or set EXPO_PUBLIC_SHUBH_SHOT.
 */
export const SHOT_IDS = [
  'home',
  'match',
  'confirm',
  'milan',
  'muhurat',
  'festivals',
  'kundli',
  'ask',
  'paywall',
] as const;

export type ShotId = (typeof SHOT_IDS)[number];

function fromSearch(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('shot');
  } catch {
    return null;
  }
}

export function readShotId(): ShotId | null {
  const raw = (fromSearch() ?? process.env.EXPO_PUBLIC_SHUBH_SHOT ?? '').trim().toLowerCase();
  return (SHOT_IDS as readonly string[]).includes(raw) ? (raw as ShotId) : null;
}

export function isShotMode(): boolean {
  return readShotId() !== null;
}
