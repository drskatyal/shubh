import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { FRAME_MUHURAT } from '../frames/fixtures';
import { PREVIEW_ASK_TURN, PREVIEW_CHART, PREVIEW_FESTIVALS } from '../../preview/fixtures';

describe('Hindi-first store shots', () => {
  it('does not gold-fill matching on the home dock', () => {
    const dock = readFileSync(new URL('../../almanac/AlmanacDock.tsx', import.meta.url), 'utf8');
    expect(dock).not.toMatch(/matchChip/);
    expect(dock).toMatch(/copy\.matching/);
  });

  it('localizes festival type instead of a raw FESTIVAL stamp', () => {
    const src = readFileSync(new URL('../../festivals/FestivalsScreen.tsx', import.meta.url), 'utf8');
    expect(src).toMatch(/त्योहार/);
    expect(src).not.toMatch(/\{fest\.type\}/);
  });

  it('keeps muhurat, kundli, and ask preview copy in Hindi', () => {
    expect(FRAME_MUHURAT[0]?.reason).toMatch(/अभिजित|भद्रा/);
    expect(PREVIEW_CHART.lagna.sign).toBe('वृषभ');
    expect(PREVIEW_CHART.planets[0]?.name).toBe('सूर्य');
    expect(PREVIEW_ASK_TURN.question).toMatch(/घर/);
    expect(PREVIEW_FESTIVALS[0]?.name).toBe('जन्माष्टमी');
    const askCard = readFileSync(new URL('../../ask/cards/AskCardView.tsx', import.meta.url), 'utf8');
    expect(askCard).toMatch(/तिथि/);
    expect(askCard).not.toMatch(/'TITHI'/);
  });
});
