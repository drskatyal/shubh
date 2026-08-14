import type { AskAudio } from './types';

type RecordingHandle = {
  stopAndUnloadAsync(): Promise<void>;
  getURI(): string | null;
};

export type Recorder = {
  start(): Promise<void>;
  stop(): Promise<AskAudio>;
};

async function readAudioBase64(uri: string): Promise<string> {
  try {
    const { File } = require('expo-file-system') as {
      File: new (path: string) => { base64(): Promise<string> };
    };
    return await new File(uri).base64();
  } catch {
    const legacy = require('expo-file-system/legacy') as {
      readAsStringAsync(
        path: string,
        opts: { encoding: string },
      ): Promise<string>;
    };
    return legacy.readAsStringAsync(uri, { encoding: 'base64' });
  }
}

export function createExpoRecorder(): Recorder {
  let recording: RecordingHandle | null = null;

  return {
    async start() {
      const { Audio } = require('expo-av') as {
        Audio: {
          requestPermissionsAsync(): Promise<{ granted: boolean }>;
          setAudioModeAsync(mode: object): Promise<void>;
          Recording: new () => RecordingHandle & {
            prepareToRecordAsync(opts: unknown): Promise<void>;
            startAsync(): Promise<void>;
          };
          RecordingOptionsPresets: { HIGH_QUALITY: unknown };
        };
      };

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        throw new Error('Microphone permission is required to ask.');
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const next = new Audio.Recording();
      await next.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await next.startAsync();
      recording = next;
    },

    async stop() {
      if (!recording) throw new Error('Not recording');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      if (!uri) throw new Error('Recording produced no file');

      const base64 = await readAudioBase64(uri);
      return { base64, mimeType: 'audio/m4a' };
    },
  };
}
