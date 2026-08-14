import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CreditWallet,
  MemoryCreditStore,
  applyMonthly,
  consumeAsk,
  emptySnapshot,
  grantPack,
  remainingAsks,
} from '../credits';
import { PRODUCTS } from '../products';

describe('credits', () => {
  it('gives one free sample, then gates at 0', () => {
    let snap = emptySnapshot();
    assert.equal(remainingAsks(snap, false), 1);
    snap = consumeAsk(snap);
    assert.equal(remainingAsks(snap, false), 0);
    assert.throws(() => consumeAsk(snap));
  });

  it('adds 100 from a pack and does not double-grant the same transaction', () => {
    let snap = consumeAsk(emptySnapshot());
    snap = grantPack(snap, 'tx-1');
    assert.equal(remainingAsks(snap, false), 100);
    snap = grantPack(snap, 'tx-1');
    assert.equal(remainingAsks(snap, false), 100);
    snap = consumeAsk(snap);
    assert.equal(remainingAsks(snap, false), 99);
  });

  it('resets monthly usage when the period id changes', () => {
    let snap = applyMonthly(emptySnapshot(), true, 'period-a');
    snap = { ...snap, usedFreeSample: true, monthlyUsed: 100 };
    assert.equal(remainingAsks(snap, false), 0);
    snap = applyMonthly(snap, true, 'period-b');
    assert.equal(remainingAsks(snap, false), 100);
  });

  it('unlocks in dev without touching the store', async () => {
    const wallet = await CreditWallet.open(new MemoryCreditStore(), {
      devUnlock: true,
    });
    assert.equal(wallet.canAsk(), true);
    assert.equal(wallet.remaining(), Number.POSITIVE_INFINITY);
    await wallet.consume();
    assert.equal(wallet.remaining(), Number.POSITIVE_INFINITY);
    assert.equal(wallet.snapshot().usedFreeSample, false);
  });

  it('exports the RevenueCat product ids from the brief', () => {
    assert.equal(PRODUCTS.monthly, 'shubh_monthly_100');
    assert.equal(PRODUCTS.pack, 'shubh_credits_100');
  });
});
