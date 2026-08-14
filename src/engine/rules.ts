import { AUSPICIOUS_CHOGHADIYA } from './tables';
import { contains } from './time';
import type {
  ChoghadiyaSlot,
  CurrentWindow,
  NamedInterval,
  StartSomethingState,
  WindowKind,
} from './types';
import { isAbhijitObserved } from './windows';
import type { ClockInterval } from './windows';
import type { Weekday } from './types';
import { toIso } from './time';

export type RuleInputs = {
  at: Date;
  weekday: Weekday;
  rahu: ClockInterval;
  yamaganda: ClockInterval;
  gulika: ClockInterval;
  abhijit: ClockInterval;
  choghadiya: ChoghadiyaSlot;
  nextChoghadiya: ChoghadiyaSlot;
  sunset: Date;
  nextSunrise: Date;
};

function inInterval(interval: ClockInterval, at: Date): boolean {
  return contains(interval.start, interval.end, at);
}

function kindOf(name: WindowKind): CurrentWindow['kind'] {
  if (name === 'rahu' || name === 'yamaganda' || name === 'gulika') {
    return 'inauspicious';
  }
  if (name === 'abhijit' || AUSPICIOUS_CHOGHADIYA.has(name as never)) {
    return 'auspicious';
  }
  return 'neutral';
}

function named(name: WindowKind, interval: ClockInterval): NamedInterval {
  return { name, start: toIso(interval.start), end: toIso(interval.end) };
}

/**
 * Current glance window: inauspicious daylight first, else observed Abhijit,
 * else the live Choghadiya. See RULES.md.
 */
export function currentWindow(input: RuleInputs): CurrentWindow {
  const { at, weekday, rahu, yamaganda, gulika, abhijit, choghadiya } = input;
  if (inInterval(rahu, at)) {
    return { ...named('rahu', rahu), kind: 'inauspicious' };
  }
  if (inInterval(yamaganda, at)) {
    return { ...named('yamaganda', yamaganda), kind: 'inauspicious' };
  }
  if (inInterval(gulika, at)) {
    return { ...named('gulika', gulika), kind: 'inauspicious' };
  }
  if (isAbhijitObserved(weekday) && inInterval(abhijit, at)) {
    return { ...named('abhijit', abhijit), kind: 'auspicious' };
  }
  return {
    name: choghadiya.name,
    start: choghadiya.start,
    end: choghadiya.end,
    kind: kindOf(choghadiya.name),
  };
}

/**
 * Now/wait for “starting something new”. RULES.md only.
 */
export function evaluateStartSomethingNew(input: RuleInputs): StartSomethingState {
  const { at, weekday, rahu, yamaganda, gulika, abhijit, choghadiya } = input;
  if (inInterval(rahu, at) || inInterval(yamaganda, at) || inInterval(gulika, at)) {
    return 'wait';
  }
  if (isAbhijitObserved(weekday) && inInterval(abhijit, at)) {
    return 'now';
  }
  return choghadiya.auspicious ? 'now' : 'wait';
}

export function nextGoodWindow(input: RuleInputs): NamedInterval | null {
  if (evaluateStartSomethingNew(input) === 'now') {
    const window = currentWindow(input);
    return { name: window.name, start: window.start, end: window.end };
  }

  const candidates: NamedInterval[] = [];
  if (isAbhijitObserved(input.weekday) && input.abhijit.end.getTime() > input.at.getTime()) {
    candidates.push(named('abhijit', input.abhijit));
  }
  candidates.push({
    name: input.nextChoghadiya.name,
    start: input.nextChoghadiya.start,
    end: input.nextChoghadiya.end,
  });

  const upcoming = candidates
    .filter((item) => new Date(item.start).getTime() >= input.at.getTime())
    .filter((item) => item.name === 'abhijit' || AUSPICIOUS_CHOGHADIYA.has(item.name as never))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (upcoming[0]) {
    return upcoming[0];
  }

  if (input.nextChoghadiya.auspicious) {
    return {
      name: input.nextChoghadiya.name,
      start: input.nextChoghadiya.start,
      end: input.nextChoghadiya.end,
    };
  }
  return null;
}
