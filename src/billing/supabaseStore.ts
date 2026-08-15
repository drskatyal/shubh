import { getAuthUser } from '../auth/session';
import { supabaseRequest } from '../auth/client';
import { isSupabaseConfigured } from '../auth/config';
import {
  emptySnapshot,
  type CreditSnapshot,
  type CreditStore,
} from './credits';
import {
  foldLedger,
  syncLedgerDeltas,
  type CreditLedgerRow,
  type RemoteLedger,
} from './ledger';
import { createAsyncStorageStore } from './store';

export class SupabaseCreditStore implements CreditStore {
  private last: CreditSnapshot | null = null;

  constructor(
    private readonly local: CreditStore,
    private readonly remote: RemoteLedger | null,
    private readonly userId: string | null,
  ) {}

  private canSync(): boolean {
    return Boolean(this.remote && this.userId);
  }

  async load(): Promise<CreditSnapshot | null> {
    const local = (await this.local.load()) ?? null;
    if (!this.canSync()) {
      this.last = local;
      return local;
    }
    try {
      const rows = await this.remote!.listLedger(this.userId!);
      const folded = foldLedger(rows);
      this.last = folded;
      await this.local.save(folded);
      return folded;
    } catch {
      this.last = local;
      return local;
    }
  }

  async save(snap: CreditSnapshot): Promise<void> {
    const prev = this.last ?? (await this.local.load()) ?? emptySnapshot();
    await this.local.save(snap);
    this.last = snap;
    if (!this.canSync()) return;
    try {
      await syncLedgerDeltas(this.remote!, prev, snap);
    } catch {
      // Local cache already holds the snapshot.
    }
  }
}

export function createSupabaseRemoteLedger(): RemoteLedger {
  return {
    async listLedger(userId) {
      const res = await supabaseRequest(
        `/rest/v1/credit_ledger?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.asc`,
      );
      if (!res || !res.ok) return [];
      return (await res.json()) as CreditLedgerRow[];
    },
    async consumeAsk(periodId) {
      await supabaseRequest('/rest/v1/rpc/consume_ask_credit', {
        method: 'POST',
        body: JSON.stringify({ p_period_id: periodId }),
      });
    },
    async grantPack(storeTxnId, amount) {
      await supabaseRequest('/rest/v1/rpc/grant_pack_credits', {
        method: 'POST',
        body: JSON.stringify({ p_store_txn_id: storeTxnId, p_amount: amount }),
      });
    },
    async grantMonthly(periodId) {
      await supabaseRequest('/rest/v1/rpc/grant_monthly_credits', {
        method: 'POST',
        body: JSON.stringify({ p_period_id: periodId }),
      });
    },
    async resetMonthly(periodId) {
      await supabaseRequest('/rest/v1/rpc/reset_monthly_credits', {
        method: 'POST',
        body: JSON.stringify({ p_period_id: periodId }),
      });
    },
  };
}

/** Local store when keys are empty or the glance user is anonymous. */
export async function createAppCreditStore(): Promise<CreditStore> {
  const local = createAsyncStorageStore();
  if (!isSupabaseConfigured()) {
    return new SupabaseCreditStore(local, null, null);
  }
  const user = await getAuthUser();
  if (!user) {
    return new SupabaseCreditStore(local, null, null);
  }
  return new SupabaseCreditStore(local, createSupabaseRemoteLedger(), user.id);
}
