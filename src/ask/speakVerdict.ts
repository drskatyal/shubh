import type { AskVerdict } from './types';

/** TTS is out of v1. Wire playback here later. */
export async function speakVerdict(_verdict: AskVerdict): Promise<void> {
  return;
}
