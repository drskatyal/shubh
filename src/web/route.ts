import { readShotId, type ShotId } from '../preview/shot';

export const WEB_LEVELS = [
  'home',
  'muhurat',
  'festivals',
  'calendar',
  'kundli',
  'matching',
  'ask',
  'paywall',
] as const;

export type WebLevel = (typeof WEB_LEVELS)[number];

const SHOT_LEVEL: Record<ShotId, WebLevel> = {
  home: 'home',
  match: 'matching',
  confirm: 'matching',
  milan: 'matching',
  muhurat: 'muhurat',
  festivals: 'festivals',
  kundli: 'kundli',
  ask: 'ask',
  paywall: 'paywall',
};

export function pathToLevel(pathname: string, hash = '', search = ''): WebLevel {
  const query = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const fromQuery = query.get('level');
  if (fromQuery && (WEB_LEVELS as readonly string[]).includes(fromQuery)) {
    return fromQuery as WebLevel;
  }
  const fromHash = hash.replace(/^#\/?/, '').split('?')[0];
  if (fromHash && (WEB_LEVELS as readonly string[]).includes(fromHash)) {
    return fromHash as WebLevel;
  }
  const clean = pathname.replace(/\/+$/, '') || '/';
  const last = clean.split('/').filter(Boolean).pop() ?? '';
  if ((WEB_LEVELS as readonly string[]).includes(last)) return last as WebLevel;
  return 'home';
}

export function levelToHash(level: WebLevel): string {
  return level === 'home' ? '#/' : `#/${level}`;
}

export function shotToLevel(shot: ShotId | null): WebLevel | null {
  return shot ? SHOT_LEVEL[shot] : null;
}

export function readWebLevel(): WebLevel {
  const fromShot = shotToLevel(readShotId());
  if (fromShot) return fromShot;
  if (typeof window === 'undefined') return 'home';
  return pathToLevel(window.location.pathname, window.location.hash, window.location.search);
}

export function pushWebLevel(level: WebLevel): void {
  if (typeof window === 'undefined' || readShotId()) return;
  const next = `${window.location.pathname}${window.location.search}${levelToHash(level)}`;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === next) return;
  window.history.pushState({ level }, '', next);
}

export function almanacTabForLevel(
  level: WebLevel,
): 'muhurat' | 'festivals' | 'calendar' | 'kundli' | 'match' | null {
  if (level === 'muhurat') return 'muhurat';
  if (level === 'festivals') return 'festivals';
  if (level === 'calendar') return 'calendar';
  if (level === 'kundli') return 'kundli';
  if (level === 'matching') return 'match';
  return null;
}

export function levelForAlmanacTab(
  tab: 'muhurat' | 'festivals' | 'calendar' | 'kundli' | 'match' | null,
): WebLevel {
  if (tab === 'muhurat') return 'muhurat';
  if (tab === 'festivals') return 'festivals';
  if (tab === 'calendar') return 'calendar';
  if (tab === 'kundli') return 'kundli';
  if (tab === 'match') return 'matching';
  return 'home';
}
