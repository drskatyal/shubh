export const PRODUCTS = {
  monthly: 'shubh_monthly_100',
  annual: 'shubh_annual_1200',
  pack: 'shubh_credits_100',
} as const;

export const ENTITLEMENTS = {
  pro: 'shubh_pro',
  monthly: 'monthly_asks',
  annual: 'annual_asks',
} as const;

export const MONTHLY_ASKS = 100;
export const PACK_ASKS = 100;

/** Test price band for Play Store India. Never default to ₹599. */
export const MONTHLY_PRICE_INR = { min: 199, max: 299 } as const;
export const ANNUAL_PRICE_INR = { min: 1999, max: 2499 } as const;
export const PACK_PRICE_INR = 799;
export const FREE_MUHURAT_DAYS = 30;
export const EXTRA_MUHURAT_DAYS = 60;
