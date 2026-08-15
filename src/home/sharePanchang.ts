import { Share, type View } from 'react-native';

import { noteSuccessfulShare } from '../store/reviewAfterShare';
import { isWebRuntime } from '../web/platform';
import { drawSharePng, panchangDrawInput } from '../share/drawCard';
import { shareOrDownload } from '../share/webShare';
import type { ShareCardModel } from './shareDay';

export type ShareCapture = () => Promise<string | null>;

async function writePng(base64: string): Promise<string> {
  const FS = require('expo-file-system') as {
    cacheDirectory?: string | null;
    writeAsStringAsync?: (uri: string, data: string, opts: { encoding: string }) => Promise<void>;
    EncodingType?: { Base64: string };
    File?: new (directory: unknown, name: string) => {
      write: (data: string, opts: { encoding: string }) => void;
      uri: string;
    };
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
      shareAsync: (
        url: string,
        opts: { mimeType: string; UTI: string; dialogTitle: string },
      ) => Promise<void>;
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

/** One-tap 1:1 image share. Caller supplies a Skia capture of the square card. */
export async function sharePanchang(
  title: string,
  capture?: ShareCapture,
  card?: ShareCardModel,
): Promise<{ uri: string | null }> {
  if (isWebRuntime() && card) {
    const blob = await drawSharePng(panchangDrawInput(card));
    await shareOrDownload({
      title,
      text: [card.tithi, card.startLabel, card.windowName, card.rahu].filter(Boolean).join('\n'),
      file: blob,
      filename: 'shubh-today.png',
    });
    await noteSuccessfulShare();
    return { uri: 'web:download' };
  }
  const uri = capture ? await capture() : null;
  if (uri) {
    await shareImageUri(uri, title);
    await noteSuccessfulShare();
    return { uri };
  }
  throw new Error('Share card image was not ready');
}
