/**
 * Play is the primary ASO surface. Apple is the same binary, second.
 * Paste source: docs/STORE-ASO.md (from src/store/aso.ts).
 * Hindi (hi-IN) is the default Play listing.
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
