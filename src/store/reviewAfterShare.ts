import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'shubh.store.review';

export type ReviewSnap = {
  shares: number;
  asked: boolean;
};

export type ReviewStore = {
  load(): Promise<ReviewSnap>;
  save(snap: ReviewSnap): Promise<void>;
};

export function emptyReviewSnap(): ReviewSnap {
  return { shares: 0, asked: false };
}

/** Pure gate: only after at least one successful share, and only once. Never on launch. */
export function shouldAskReview(snap: ReviewSnap): boolean {
  return snap.shares >= 1 && !snap.asked;
}

export function asyncReviewStore(): ReviewStore {
  return {
    async load() {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return emptyReviewSnap();
        const parsed = JSON.parse(raw) as ReviewSnap;
        return {
          shares: Number(parsed.shares) || 0,
          asked: Boolean(parsed.asked),
        };
      } catch {
        return emptyReviewSnap();
      }
    },
    async save(snap) {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(snap));
      } catch {
        // Device storage can be unavailable in tests / web.
      }
    },
  };
}

type ReviewApi = {
  isAvailableAsync(): Promise<boolean>;
  requestReview(): Promise<void>;
};

function loadReviewApi(): ReviewApi | null {
  try {
    return require('expo-store-review') as ReviewApi;
  } catch {
    return null;
  }
}

export async function noteSuccessfulShare(
  store: ReviewStore = asyncReviewStore(),
  review: ReviewApi | null = loadReviewApi(),
): Promise<ReviewSnap> {
  const snap = await store.load();
  const next: ReviewSnap = { ...snap, shares: snap.shares + 1 };
  if (shouldAskReview(next) && review) {
    try {
      if (await review.isAvailableAsync()) {
        await review.requestReview();
        next.asked = true;
      }
    } catch {
      // Review sheet is best-effort. Share already succeeded.
    }
  }
  await store.save(next);
  return next;
}
