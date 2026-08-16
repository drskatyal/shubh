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
import { ANNUAL_PRICE_INR, MONTHLY_PRICE_INR, PACK_PRICE_INR, PRODUCTS } from '../products';

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

  it('exports the RevenueCat product ids and India test prices', async () => {
    assert.equal(PRODUCTS.monthly, 'shubh_monthly_100');
    assert.equal(PRODUCTS.annual, 'shubh_annual_1200');
    assert.equal(PRODUCTS.pack, 'shubh_credits_100');
    assert.equal(MONTHLY_PRICE_INR.min, 199);
    assert.equal(MONTHLY_PRICE_INR.max, 299);
    assert.equal(ANNUAL_PRICE_INR.min, 1999);
    assert.equal(ANNUAL_PRICE_INR.max, 2499);
    assert.equal(PACK_PRICE_INR, 799);
    assert.notEqual(MONTHLY_PRICE_INR.max, 599);
    const wallet = await CreditWallet.open(new MemoryCreditStore());
    assert.equal(wallet.isPro(), false);
    assert.equal(wallet.muhuratDays(), 30);
    await wallet.setMonthly(true, 'period-a');
    assert.equal(wallet.isPro(), true);
    assert.equal(wallet.muhuratDays(), 60);
  });
});
