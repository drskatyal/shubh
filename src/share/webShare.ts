export type WebShareInput = {
  title: string;
  text: string;
  file?: Blob;
  filename?: string;
};

function downloadBlob(file: Blob, filename: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Web Share API when the browser can send a file; otherwise download the PNG. */
export async function shareOrDownload(input: WebShareInput): Promise<'share' | 'download' | 'text'> {
  const filename = input.filename ?? 'shubh.png';
  const file = input.file
    ? new File([input.file], filename, { type: input.file.type || 'image/png' })
    : null;

  const nav = typeof navigator === 'undefined' ? null : navigator;
  if (file && nav?.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ title: input.title, text: input.text, files: [file] });
    return 'share';
  }
  if (file && typeof document !== 'undefined') {
    downloadBlob(file, filename);
    return 'download';
  }
  if (nav?.share) {
    await nav.share({ title: input.title, text: input.text });
    return 'text';
  }
  if (typeof document !== 'undefined') {
    const blob = new Blob([input.text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, filename.replace(/\.png$/i, '.txt'));
    return 'download';
  }
  throw new Error('Share is not available');
}
