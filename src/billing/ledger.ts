import {
  applyMonthly,
  consumeAsk,
  emptySnapshot,
  type CreditSnapshot,
} from './credits';
import { PACK_ASKS } from './products';

export const LEDGER_KINDS = [
  'ask_consume',
  'pack_grant',
  'monthly_grant',
  'monthly_reset',
] as const;

export type LedgerKind = (typeof LEDGER_KINDS)[number];

export type CreditLedgerRow = {
  id: string;
  user_id: string;
  kind: LedgerKind;
  amount: number;
  period_id: string | null;
  store_txn_id: string | null;
  created_at: string;
};

export type RemoteLedger = {
  listLedger(userId: string): Promise<CreditLedgerRow[]>;
  consumeAsk(periodId: string | null): Promise<void>;
  grantPack(storeTxnId: string, amount: number): Promise<void>;
  grantMonthly(periodId: string): Promise<void>;
  resetMonthly(periodId: string): Promise<void>;
};

export function foldLedger(rows: CreditLedgerRow[]): CreditSnapshot {
  const ordered = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  let snap = emptySnapshot();
  for (const row of ordered) {
    if (row.kind === 'pack_grant') {
      const txn = row.store_txn_id ?? row.id;
      if (snap.grantedPackIds.includes(txn)) continue;
      const add = row.amount > 0 ? row.amount : PACK_ASKS;
      snap = {
        ...snap,
        packRemaining: snap.packRemaining + add,
        grantedPackIds: [...snap.grantedPackIds, txn],
      };
      continue;
    }
    if (row.kind === 'monthly_grant') {
      snap = applyMonthly(snap, true, row.period_id);
      continue;
    }
    if (row.kind === 'monthly_reset') {
      snap = applyMonthly(snap, true, row.period_id);
      continue;
    }
    if (row.kind === 'ask_consume') {
      try {
        snap = consumeAsk(snap);
      } catch {
        // Extra consume rows do not invent remaining.
      }
    }
  }
  return snap;
}

export async function syncLedgerDeltas(
  remote: RemoteLedger,
  prev: CreditSnapshot,
  next: CreditSnapshot,
): Promise<void> {
  for (const id of next.grantedPackIds) {
    if (!prev.grantedPackIds.includes(id)) {
      await remote.grantPack(id, PACK_ASKS);
    }
  }
  if (next.monthlyActive && !prev.monthlyActive && next.monthlyPeriodId) {
    await remote.grantMonthly(next.monthlyPeriodId);
  }
  if (
    next.monthlyPeriodId &&
    prev.monthlyPeriodId &&
    next.monthlyPeriodId !== prev.monthlyPeriodId
  ) {
    await remote.resetMonthly(next.monthlyPeriodId);
  }
  let consumes = 0;
  if (next.usedFreeSample && !prev.usedFreeSample) consumes += 1;
  if (next.packRemaining < prev.packRemaining) {
    consumes += prev.packRemaining - next.packRemaining;
  }
  if (next.monthlyUsed > prev.monthlyUsed) {
    consumes += next.monthlyUsed - prev.monthlyUsed;
  }
  for (let i = 0; i < consumes; i += 1) {
    await remote.consumeAsk(next.monthlyPeriodId);
  }
}
