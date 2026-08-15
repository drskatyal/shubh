import type { AskAudio } from './types';

export function fileInsteadLabel(language: 'en' | 'hi'): string {
  return language === 'hi' ? 'फाइल से?' : 'From a file?';
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function audioFromBlob(blob: Blob, mimeType?: string): Promise<AskAudio> {
  return {
    base64: await blobToBase64(blob),
    mimeType: mimeType || blob.type || 'audio/webm',
  };
}

export async function pickAudioFile(): Promise<File | null> {
  if (typeof document === 'undefined') return null;
  return await new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,.m4a,.mp3,.wav,.webm,.aac,.ogg';
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}
