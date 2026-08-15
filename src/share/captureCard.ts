import { Share } from 'react-native';

import { noteSuccessfulShare } from '../store/reviewAfterShare';
import { isWebRuntime } from '../web/platform';
import { drawSharePng, textDrawInput } from './drawCard';
import { shareOrDownload } from './webShare';

export type CaptureHandle = {
  capture?: () => Promise<string>;
};

export async function shareCard(input: {
  title: string;
  message: string;
  viewRef?: { current: CaptureHandle | null };
}): Promise<void> {
  if (isWebRuntime()) {
    const blob = await drawSharePng(textDrawInput(input.title, input.message));
    await shareOrDownload({
      title: input.title,
      text: input.message,
      file: blob,
      filename: 'shubh.png',
    });
    await noteSuccessfulShare();
    return;
  }
  const uri = await input.viewRef?.current?.capture?.().catch(() => null);
  if (uri) {
    await Share.share({
      title: input.title,
      message: input.message,
      url: uri,
    });
    await noteSuccessfulShare();
    return;
  }
  await Share.share({ title: input.title, message: input.message });
  await noteSuccessfulShare();
}
