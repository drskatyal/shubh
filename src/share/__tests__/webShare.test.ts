import { afterEach, describe, expect, it, vi } from 'vitest';

import { panchangDrawInput, textDrawInput } from '../drawCard';
import { shareOrDownload } from '../webShare';

describe('web share', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('downloads a PNG when the browser cannot share files', async () => {
    const clicks: string[] = [];
    const link = {
      href: '',
      download: '',
      rel: '',
      click: () => clicks.push(link.download),
      remove: () => undefined,
    };
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', {
      createElement: (tag: string) => {
        if (tag !== 'a') throw new Error(tag);
        return link;
      },
      body: { appendChild: () => undefined },
    });
    vi.stubGlobal('URL', {
      createObjectURL: () => 'blob:shubh',
      revokeObjectURL: () => undefined,
    });
    vi.stubGlobal('window', { setTimeout: (fn: () => void) => fn() });

    const used = await shareOrDownload({
      title: 'शुभ',
      text: 'आज',
      file: new Blob(['png'], { type: 'image/png' }),
      filename: 'shubh-today.png',
    });
    expect(used).toBe('download');
    expect(clicks).toEqual(['shubh-today.png']);
  });

  it('uses the Web Share API when files are allowed', async () => {
    const share = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    });
    const used = await shareOrDownload({
      title: 'Shubh',
      text: 'Today',
      file: new Blob(['png'], { type: 'image/png' }),
      filename: 'shubh.png',
    });
    expect(used).toBe('share');
    expect(share).toHaveBeenCalledOnce();
  });

  it('keeps draw copy provider-silent', () => {
    const drawn = textDrawInput('शुभ', 'टालें\nराहु काल 11:07–12:43');
    expect(drawn.title).toBe('टालें');
    expect(JSON.stringify(drawn)).not.toMatch(/gemini|openai|llm|chatbot/i);
    const panchang = panchangDrawInput({
      app: 'शुभ',
      city: 'मुंबई',
      date: '2026-08-15',
      dateLabel: 'शनिवार, 15 अग॰',
      tithi: 'शुक्ल द्वितीया',
      paksha: 'शुक्ल पक्ष',
      nakshatra: 'पूर्वा फाल्गुनी',
      startSomething: 'avoid',
      startLabel: 'टालें',
      rule: 'नई शुरुआत के लिए',
      windowName: 'रोग',
      rahu: 'राहु काल 11:07–12:43',
    });
    expect(panchang.brand).toBe('शुभ');
  });
});
