import type { StartSomethingState } from '../engine';
import type { Language } from '../i18n/strings';

export type GlancePayload = {
  city: string;
  windowName: string;
  tithi?: string;
  state: StartSomethingState;
  language: Language;
};

/**
 * Existing widget reads city + windowName + now/wait.
 * Put today’s tithi on windowName so we do not invent a second widget.
 * Do not also set `tithi` to the same string — Android concatenates
 * `windowName · tithi` and would show the tithi twice.
 */
export function buildGlance(input: GlancePayload): GlancePayload {
  const tithi = input.tithi?.trim();
  return {
    city: input.city,
    windowName: tithi || input.windowName,
    tithi: undefined,
    state: input.state,
    language: input.language,
  };
}
