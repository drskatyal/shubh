import { Share, type View } from 'react-native';

import type { DayContextView } from '../tathaastu';
import { buildShareCard } from './shareDay';

export type ShareCapture = () => Promise<string | null>;

async function writePng(base64: string): Promise<string> {
  const FS = require('expo-file-system') as {
    cacheDirectory?: string | null;
    writeAsStringAsync?: (uri: string, data: string, opts: { encoding: string }) => Promise<void>;
    EncodingType?: { Base64: string };
    File?: new (directory: unknown, name: string) => { write: (data: string, opts: { encoding: string }) => void; uri: string };
    Paths?: { cache: unknown };
  };
  if (FS.cacheDirectory && FS.writeAsStringAsync) {
    const uri = `${FS.cacheDirectory}shubh-today.png`;
    await FS.writeAsStringAsync(uri, base64, {
      encoding: FS.EncodingType?.Base64 ?? 'base64',
    });
    return uri;
  }
  if (FS.File && FS.Paths) {
    const file = new FS.File(FS.Paths.cache, 'shubh-today.png');
    file.write(base64, { encoding: 'base64' });
    return file.uri;
  }
  throw new Error('Could not write share image');
}

async function shareImageUri(uri: string, title: string): Promise<void> {
  try {
    const Sharing = require('expo-sharing') as {
      isAvailableAsync: () => Promise<boolean>;
      shareAsync: (url: string, opts: { mimeType: string; UTI: string; dialogTitle: string }) => Promise<void>;
    };
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: title,
      });
      return;
    }
  } catch {
    // Expo Go / tests may not have expo-sharing.
  }
  await Share.share({ url: uri, title });
}

export async function captureViewPng(view: View | null): Promise<string | null> {
  if (!view) return null;
  try {
    const { makeImageFromView } = require('@shopify/react-native-skia') as {
      makeImageFromView: (ref: { current: View }) => Promise<{ encodeToBase64: () => string } | null>;
    };
    const image = await makeImageFromView({ current: view });
    if (!image) return null;
    return writePng(image.encodeToBase64());
  } catch {
    return null;
  }
}

/** One-tap image share. Caller supplies a capture of the 1:1 card. */
export async function sharePanchang(
  day: DayContextView,
  capture?: ShareCapture,
): Promise<{ uri: string | null }> {
  const card = buildShareCard(day);
  const uri = capture ? await capture() : null;
  if (uri) {
    await shareImageUri(uri, card.app);
    return { uri };
  }
  throw new Error('Share card image was not ready');
}
