/**
 * Store listing + screenshot order. App Store Connect / Play Console
 * paste source is docs/STORE-ASO.md (generated from src/store/aso.ts).
 */
export {
  STORE_SCREENSHOTS,
  appleEn,
  appleHi,
  playEn,
  playHi,
} from './src/store/aso';

export const STORE_REVIEW_POLICY = {
  trigger: 'after_successful_share',
  neverOnFirstLaunch: true,
  oncePerInstall: true,
} as const;
