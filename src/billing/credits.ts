import { isDevUnlock } from '../config/env';
import { MONTHLY_ASKS, PACK_ASKS } from './products';

export type CreditSnapshot = {
  usedFreeSample: boolean;
  monthlyActive: boolean;
  monthlyPeriodId: string | null;
  monthlyUsed: number;
  packRemaining: number;
  grantedPackIds: string[];
};

export type CreditStore = {
  load(): Promise<CreditSnapshot | null>;
  save(snap: CreditSnapshot): Promise<void>;
};

export function emptySnapshot(): CreditSnapshot {
  return {
    usedFreeSample: false,
    monthlyActive: false,
    monthlyPeriodId: null,
    monthlyUsed: 0,
    packRemaining: 0,
    grantedPackIds: [],
  };
}

export function remainingAsks(snap: CreditSnapshot, devUnlock: boolean): number {
  if (devUnlock) return Number.POSITIVE_INFINITY;
  const free = snap.usedFreeSample ? 0 : 1;
  const monthly = snap.monthlyActive
    ? Math.max(0, MONTHLY_ASKS - snap.monthlyUsed)
    : 0;
  return free + monthly + snap.packRemaining;
}

export function consumeAsk(snap: CreditSnapshot): CreditSnapshot {
  if (!snap.usedFreeSample) return { ...snap, usedFreeSample: true };
  if (snap.packRemaining > 0) {
    return { ...snap, packRemaining: snap.packRemaining - 1 };
  }
  if (snap.monthlyActive && snap.monthlyUsed < MONTHLY_ASKS) {
    return { ...snap, monthlyUsed: snap.monthlyUsed + 1 };
  }
  throw new Error('no_credits');
}

export function grantPack(
  snap: CreditSnapshot,
  transactionId: string,
): CreditSnapshot {
  if (snap.grantedPackIds.includes(transactionId)) return snap;
  return {
    ...snap,
    packRemaining: snap.packRemaining + PACK_ASKS,
    grantedPackIds: [...snap.grantedPackIds, transactionId],
  };
}

export function applyMonthly(
  snap: CreditSnapshot,
  active: boolean,
  periodId: string | null,
): CreditSnapshot {
  const rolled = periodId && periodId !== snap.monthlyPeriodId;
  return {
    ...snap,
    monthlyActive: active,
    monthlyPeriodId: periodId,
    monthlyUsed: rolled ? 0 : snap.monthlyUsed,
  };
}

export class MemoryCreditStore implements CreditStore {
  constructor(private snap: CreditSnapshot | null = null) {}

  async load(): Promise<CreditSnapshot | null> {
    return this.snap ? { ...this.snap } : null;
  }

  async save(snap: CreditSnapshot): Promise<void> {
    this.snap = { ...snap };
  }
}

export class CreditWallet {
  private constructor(
    private readonly store: CreditStore,
    private readonly devUnlock: boolean,
    private snap: CreditSnapshot,
  ) {}

  static async open(
    store: CreditStore,
    flags: { devUnlock?: boolean } = {},
  ): Promise<CreditWallet> {
    const loaded = await store.load();
    return new CreditWallet(
      store,
      flags.devUnlock ?? isDevUnlock(),
      loaded ?? emptySnapshot(),
    );
  }

  remaining(): number {
    return remainingAsks(this.snap, this.devUnlock);
  }

  canAsk(): boolean {
    return this.remaining() > 0;
  }

  snapshot(): CreditSnapshot {
    return { ...this.snap };
  }

  async consume(): Promise<number> {
    if (this.devUnlock) return this.remaining();
    this.snap = consumeAsk(this.snap);
    await this.store.save(this.snap);
    return this.remaining();
  }

  async grantPack(transactionId: string): Promise<void> {
    this.snap = grantPack(this.snap, transactionId);
    await this.store.save(this.snap);
  }

  async setMonthly(active: boolean, periodId: string | null): Promise<void> {
    this.snap = applyMonthly(this.snap, active, periodId);
    await this.store.save(this.snap);
  }
}
