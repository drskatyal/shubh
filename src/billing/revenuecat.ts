import { getRevenueCatApiKey } from '../config/env';
import type { CreditWallet } from './credits';
import { PRODUCTS } from './products';

type CustomerInfo = {
  entitlements: {
    active: Record<string, { latestPurchaseDate?: string | null }>;
  };
  nonSubscriptionTransactions?: Array<{
    productIdentifier: string;
    transactionIdentifier: string;
  }>;
};

type PurchasesLike = {
  configure(opts: { apiKey: string }): void;
  getCustomerInfo(): Promise<CustomerInfo>;
  getOfferings(): Promise<{
    current?: {
      availablePackages?: Array<{
        product: { identifier: string };
        identifier: string;
      }>;
    } | null;
  }>;
  purchasePackage(pkg: unknown): Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases(): Promise<CustomerInfo>;
};

function loadPurchases(): PurchasesLike | null {
  try {
    return require('react-native-purchases').default as PurchasesLike;
  } catch {
    return null;
  }
}

export async function initPurchases(): Promise<PurchasesLike | null> {
  const key = getRevenueCatApiKey();
  const Purchases = loadPurchases();
  if (!key || !Purchases) return null;
  try {
    Purchases.configure({ apiKey: key });
    return Purchases;
  } catch {
    return null;
  }
}

export async function syncEntitlements(
  wallet: CreditWallet,
  purchases?: PurchasesLike | null,
): Promise<void> {
  const client = purchases === undefined ? await initPurchases() : purchases;
  if (!client) return;
  try {
    const info = await client.getCustomerInfo();
    await applyCustomerInfo(wallet, info);
  } catch {
    // Paywall still works from the local wallet (free sample / packs already granted).
  }
}

export async function applyCustomerInfo(
  wallet: CreditWallet,
  info: CustomerInfo,
): Promise<void> {
  const monthly =
    info.entitlements.active.monthly_asks ??
    info.entitlements.active[PRODUCTS.monthly];
  await wallet.setMonthly(
    Boolean(monthly),
    monthly?.latestPurchaseDate ?? null,
  );

  for (const tx of info.nonSubscriptionTransactions ?? []) {
    if (tx.productIdentifier === PRODUCTS.pack) {
      await wallet.grantPack(tx.transactionIdentifier);
    }
  }
}

export async function purchaseMonthly(): Promise<CustomerInfo | null> {
  return purchaseByProduct(PRODUCTS.monthly);
}

export async function purchasePack(): Promise<CustomerInfo | null> {
  return purchaseByProduct(PRODUCTS.pack);
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  const client = await initPurchases();
  if (!client) {
    throw new Error(
      'Purchases are not configured. Set EXPO_PUBLIC_REVENUECAT_API_KEY on a store build.',
    );
  }
  return client.restorePurchases();
}

async function purchaseByProduct(productId: string): Promise<CustomerInfo | null> {
  const client = await initPurchases();
  if (!client) {
    throw new Error(
      'Purchases are not configured. Set EXPO_PUBLIC_REVENUECAT_API_KEY on a store build.',
    );
  }
  const offerings = await client.getOfferings();
  const pkg = offerings.current?.availablePackages?.find(
    (item) => item.product.identifier === productId,
  );
  if (!pkg) {
    throw new Error(`Store product ${productId} is not in the current offering.`);
  }
  const result = await client.purchasePackage(pkg);
  return result.customerInfo;
}
