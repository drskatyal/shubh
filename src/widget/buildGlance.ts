import type { StartSomethingState } from '../engine';
import type { Language } from '../i18n/strings';

export type GlancePayload = {
  city: string;
  windowName: string;
  tithi?: string;
  state: StartSomethingState;
  language: Language;
};

export function buildGlance(input: GlancePayload): GlancePayload {
  return {
    city: input.city,
    windowName: input.tithi ?? input.windowName,
    tithi: input.tithi ?? input.windowName,
    state: input.state,
    language: input.language,
  };
}
