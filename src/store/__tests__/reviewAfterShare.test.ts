import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  emptyReviewSnap,
  noteSuccessfulShare,
  shouldAskReview,
  type ReviewSnap,
  type ReviewStore,
} from '../reviewAfterShare';

function memoryStore(initial: ReviewSnap = emptyReviewSnap()): ReviewStore & { snap: ReviewSnap } {
  const box = { snap: { ...initial } };
  return {
    get snap() {
      return box.snap;
    },
    async load() {
      return { ...box.snap };
    },
    async save(next) {
      box.snap = { ...next };
    },
  };
}

describe('review after share', () => {
  it('does not ask on a fresh install (first launch)', () => {
    expect(shouldAskReview(emptyReviewSnap())).toBe(false);
  });

  it('asks only after a successful share, and only once', async () => {
    const store = memoryStore();
    const calls: string[] = [];
    const review = {
      async isAvailableAsync() {
        return true;
      },
      async requestReview() {
        calls.push('ask');
      },
    };

    expect(shouldAskReview(await store.load())).toBe(false);

    const afterShare = await noteSuccessfulShare(store, review);
    expect(afterShare.shares).toBe(1);
    expect(afterShare.asked).toBe(true);
    expect(calls).toEqual(['ask']);

    await noteSuccessfulShare(store, review);
    expect(calls).toEqual(['ask']);
    expect((await store.load()).asked).toBe(true);
  });

  it('is not imported from App launch', () => {
    const app = readFileSync(new URL('../../../App.tsx', import.meta.url), 'utf8');
    const gate = readFileSync(new URL('../../home/LanguageGate.tsx', import.meta.url), 'utf8');
    expect(app).not.toMatch(/reviewAfterShare|requestReview|StoreReview/);
    expect(gate).not.toMatch(/reviewAfterShare|requestReview|StoreReview/);
  });
});
