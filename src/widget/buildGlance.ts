import type { StartSomethingState } from '../engine';
import type { Language } from '../i18n/strings';

export type GlancePayload = {
  city: string;
  windowName: string;
  state: StartSomethingState;
  language: Language;
  tithi?: string;
};

export function buildGlance(input: GlancePayload): GlancePayload {
  return {
    city: input.city,
    windowName: input.windowName,
    state: input.state,
    language: input.language,
    tithi: input.tithi,
  };
}
