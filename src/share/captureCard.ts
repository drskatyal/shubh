import { Share } from 'react-native';

export type CaptureHandle = {
  capture?: () => Promise<string>;
};

export async function shareCard(input: {
  title: string;
  message: string;
  viewRef?: { current: CaptureHandle | null };
}): Promise<void> {
  const uri = await input.viewRef?.current?.capture?.().catch(() => null);
  if (uri) {
    await Share.share({
      title: input.title,
      message: input.message,
      url: uri,
    });
    return;
  }
  await Share.share({ title: input.title, message: input.message });
}
