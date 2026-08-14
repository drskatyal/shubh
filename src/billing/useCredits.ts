import { useCallback, useEffect, useState } from 'react';
import { isDevUnlock } from '../config/env';
import { CreditWallet } from './credits';
import {
  applyCustomerInfo,
  purchaseMonthly,
  purchasePack,
  restorePurchases,
  syncEntitlements,
} from './revenuecat';
import { createAsyncStorageStore } from './store';

export function useCredits() {
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await CreditWallet.open(createAsyncStorageStore(), {
        devUnlock: isDevUnlock(),
      });
      await syncEntitlements(next);
      if (cancelled) return;
      setWallet(next);
      setRemaining(next.remaining());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => {
    if (wallet) setRemaining(wallet.remaining());
  }, [wallet]);

  const buyMonthly = useCallback(async () => {
    if (!wallet) return;
    const info = await purchaseMonthly();
    if (info) await applyCustomerInfo(wallet, info);
    refresh();
  }, [wallet, refresh]);

  const buyPack = useCallback(async () => {
    if (!wallet) return;
    const info = await purchasePack();
    if (info) await applyCustomerInfo(wallet, info);
    refresh();
  }, [wallet, refresh]);

  const restore = useCallback(async () => {
    if (!wallet) return;
    const info = await restorePurchases();
    if (info) await applyCustomerInfo(wallet, info);
    refresh();
  }, [wallet, refresh]);

  return {
    wallet,
    remaining,
    ready,
    refresh,
    buyMonthly,
    buyPack,
    restore,
  };
}
