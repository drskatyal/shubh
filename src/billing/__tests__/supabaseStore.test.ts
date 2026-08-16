import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { CreditWallet, MemoryCreditStore, remainingAsks } from '../credits';
import {
  foldLedger,
  syncLedgerDeltas,
  type CreditLedgerRow,
  type RemoteLedger,
} from '../ledger';
import { SupabaseCreditStore } from '../supabaseStore';

function row(
  partial: Partial<CreditLedgerRow> & Pick<CreditLedgerRow, 'kind'>,
): CreditLedgerRow {
  return {
    id: partial.id ?? partial.kind,
    user_id: partial.user_id ?? 'user-1',
    kind: partial.kind,
    amount: partial.amount ?? (partial.kind === 'ask_consume' ? -1 : 100),
    period_id: partial.period_id ?? null,
    store_txn_id: partial.store_txn_id ?? null,
    created_at: partial.created_at ?? '2026-01-01T00:00:00.000Z',
  };
}

class MemoryRemote implements RemoteLedger {
  rows: CreditLedgerRow[] = [];
  calls: string[] = [];

  async listLedger() {
    return [...this.rows];
  }

  async consumeAsk(periodId: string | null) {
    this.calls.push(`consume:${periodId ?? ''}`);
    this.rows.push(
      row({
        kind: 'ask_consume',
        id: `c-${this.rows.length}`,
        period_id: periodId,
        created_at: `2026-01-01T00:00:${String(this.rows.length).padStart(2, '0')}.000Z`,
      }),
    );
  }

  async grantPack(storeTxnId: string, amount: number) {
    this.calls.push(`pack:${storeTxnId}:${amount}`);
    this.rows.push(
      row({
        kind: 'pack_grant',
        id: storeTxnId,
        amount,
        store_txn_id: storeTxnId,
      }),
    );
  }

  async grantMonthly(periodId: string) {
    this.calls.push(`monthly:${periodId}`);
    this.rows.push(row({ kind: 'monthly_grant', period_id: periodId, amount: 100 }));
  }

  async resetMonthly(periodId: string) {
    this.calls.push(`reset:${periodId}`);
    this.rows.push(row({ kind: 'monthly_reset', period_id: periodId, amount: 0 }));
  }
}

describe('SupabaseCreditStore', () => {
  it('stays local when remote or user is missing (empty keys / anonymous glance)', async () => {
    const remote = new MemoryRemote();
    const local = new MemoryCreditStore();
    const store = new SupabaseCreditStore(local, null, null);
    const wallet = await CreditWallet.open(store);
    assert.equal(wallet.remaining(), 1);
    await wallet.consume();
    assert.equal(wallet.remaining(), 0);
    assert.deepEqual(remote.calls, []);
    assert.equal((await local.load())?.usedFreeSample, true);
  });

  it('does not sync an anonymous glance even if a remote exists', async () => {
    const remote = new MemoryRemote();
    const store = new SupabaseCreditStore(new MemoryCreditStore(), remote, null);
    const wallet = await CreditWallet.open(store);
    await wallet.consume();
    assert.deepEqual(remote.calls, []);
  });

  it('folds a remote ledger with the same credit math', () => {
    const snap = foldLedger([
      row({ kind: 'ask_consume', created_at: '2026-01-01T00:00:00.000Z' }),
      row({
        kind: 'pack_grant',
        store_txn_id: 'tx-1',
        amount: 100,
        created_at: '2026-01-01T00:01:00.000Z',
      }),
      row({ kind: 'ask_consume', created_at: '2026-01-01T00:02:00.000Z' }),
    ]);
    assert.equal(remainingAsks(snap, false), 99);
    assert.equal(snap.usedFreeSample, true);
    assert.equal(snap.packRemaining, 99);
  });

  it('syncs consume and pack grant through ledger RPCs, not a remaining column', async () => {
    const remote = new MemoryRemote();
    const store = new SupabaseCreditStore(new MemoryCreditStore(), remote, 'user-1');
    const wallet = await CreditWallet.open(store);
    await wallet.consume();
    await wallet.grantPack('tx-pack');
    await wallet.consume();
    assert.deepEqual(remote.calls, ['consume:', 'pack:tx-pack:100', 'consume:']);
    const folded = foldLedger(remote.rows);
    assert.equal(remainingAsks(folded, false), 99);
    assert.equal(wallet.remaining(), 99);
  });

  it('loads the folded ledger after sign-in', async () => {
    const remote = new MemoryRemote();
    remote.rows = [
      row({ kind: 'ask_consume', created_at: '2026-01-01T00:00:00.000Z' }),
      row({
        kind: 'monthly_grant',
        period_id: 'period-a',
        created_at: '2026-01-01T00:01:00.000Z',
      }),
    ];
    const store = new SupabaseCreditStore(new MemoryCreditStore(), remote, 'user-1');
    const wallet = await CreditWallet.open(store);
    assert.equal(wallet.remaining(), 100);
    assert.equal(wallet.isPro(), true);
  });

  it('never writes a remaining-count column from the client', () => {
    const src = readFileSync(new URL('../supabaseStore.ts', import.meta.url), 'utf8');
    assert.doesNotMatch(src, /remaining_count|asks_remaining/);
    assert.match(src, /rpc\/consume_ask_credit/);
  });

  it('records a period reset without changing consume math', async () => {
    const remote = new MemoryRemote();
    const prev = foldLedger([
      row({ kind: 'ask_consume', created_at: '2026-01-01T00:00:00.000Z' }),
      row({
        kind: 'monthly_grant',
        period_id: 'period-a',
        created_at: '2026-01-01T00:01:00.000Z',
      }),
    ]);
    const next = {
      ...prev,
      monthlyPeriodId: 'period-b',
      monthlyUsed: 0,
    };
    await syncLedgerDeltas(remote, prev, next);
    assert.deepEqual(remote.calls, ['reset:period-b']);
  });
});
