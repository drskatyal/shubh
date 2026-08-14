import type { SkyState } from '../engine';
import type { AskVerdict, VerdictKind } from './types';

export function clocksInSky(sky: SkyState): Set<string> {
  const clocks = new Set<string>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (typeof record.clock === 'string') clocks.add(record.clock);
    for (const child of Object.values(record)) visit(child);
  };
  visit(sky);
  return clocks;
}

export function extractJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fence ? fence[1].trim() : trimmed;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Model reply was not JSON');
  }
  const parsed: unknown = JSON.parse(text.slice(start, end + 1));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Model reply was not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

function asVerdict(value: unknown): VerdictKind {
  if (value === 'now' || value === 'wait' || value === 'after') return value;
  throw new Error('Model returned an invalid verdict');
}

/**
 * Structured verdict. Any nextTime that is not already in the sky JSON is dropped.
 */
export function parseVerdict(raw: string, sky: SkyState): AskVerdict {
  const json = extractJsonObject(raw);
  const verdict = asVerdict(json.verdict);
  const reason = typeof json.reason === 'string' ? json.reason.trim() : '';
  const displayText =
    typeof json.displayText === 'string' ? json.displayText.trim() : '';
  if (!reason || !displayText) {
    throw new Error('Model omitted reason or displayText');
  }

  let nextTime =
    typeof json.nextTime === 'string' && json.nextTime.trim()
      ? json.nextTime.trim()
      : null;
  if (nextTime && !clocksInSky(sky).has(nextTime)) {
    nextTime = null;
  }

  return { verdict, nextTime, reason, displayText };
}
