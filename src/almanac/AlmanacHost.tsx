import type { CreditWallet } from '../billing/credits';
import { CalendarScreen } from '../calendar/CalendarScreen';
import type { SkyState } from '../engine';
import { FestivalsScreen } from '../festivals/FestivalsScreen';
import type { Copy, Language } from '../i18n/strings';
import { KundliScreen, MatchingScreen } from '../kundli';
import type { City } from '../location/cities';
import { MuhuratScreen } from '../muhurat/MuhuratScreen';
import {
  PREVIEW_CHART,
  PREVIEW_EXTRACT,
  PREVIEW_FESTIVALS,
  PREVIEW_MATCH,
  PREVIEW_MUHURAT,
} from '../preview/fixtures';
import type { ShotId } from '../preview/shot';
import type { NormalizedDay, NormalizedMatch } from '../tathaastu/types';
import type { AlmanacTab } from './AlmanacDock';

export function AlmanacHost({
  tab,
  onClose,
  city,
  language,
  copy,
  wallet,
  onRemainingChange,
  onBuyMonthly,
  onBuyAnnual,
  onBuyPack,
  onRestore,
  onOpenPaywall,
  sky,
  dayContext,
  onMatch,
  shot,
  embedded,
}: {
  tab: AlmanacTab | null;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
  wallet: CreditWallet | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyAnnual?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
  onOpenPaywall?: () => void;
  sky?: SkyState | null;
  dayContext?: NormalizedDay | null;
  onMatch?: (match: NormalizedMatch) => void;
  shot?: ShotId | null;
  embedded?: boolean;
}) {
  return (
    <>
      <MuhuratScreen
        visible={tab === 'muhurat'}
        onClose={onClose}
        city={city}
        language={language}
        copy={copy}
        days={shot === 'muhurat' ? 60 : wallet?.muhuratDays()}
        previewDates={shot === 'muhurat' ? PREVIEW_MUHURAT : undefined}
        onUnlock={async () => onOpenPaywall?.()}
        embedded={embedded}
      />
      <FestivalsScreen
        visible={tab === 'festivals'}
        onClose={onClose}
        city={city}
        language={language}
        copy={copy}
        canRemind={shot === 'festivals' ? true : (wallet?.isPro() ?? false)}
        previewFestivals={shot === 'festivals' ? PREVIEW_FESTIVALS : undefined}
        onUnlock={async () => onOpenPaywall?.()}
        embedded={embedded}
      />
      <CalendarScreen
        visible={tab === 'calendar'}
        onClose={onClose}
        city={city}
        language={language}
        copy={copy}
        embedded={embedded}
      />
      <KundliScreen
        visible={tab === 'kundli'}
        onClose={onClose}
        copy={copy}
        language={language}
        defaultCity={city}
        wallet={wallet}
        onRemainingChange={onRemainingChange}
        onBuyMonthly={onBuyMonthly}
        onBuyAnnual={onBuyAnnual}
        onBuyPack={onBuyPack}
        onRestore={onRestore}
        previewChart={shot === 'kundli' ? PREVIEW_CHART : undefined}
        embedded={embedded}
      />
      <MatchingScreen
        visible={tab === 'match'}
        onClose={onClose}
        copy={copy}
        language={language}
        defaultCity={city}
        wallet={wallet}
        sky={sky}
        dayContext={dayContext}
        onRemainingChange={onRemainingChange}
        onBuyMonthly={onBuyMonthly}
        onBuyAnnual={onBuyAnnual}
        onBuyPack={onBuyPack}
        onRestore={onRestore}
        onMatch={onMatch}
        initialExtract={shot === 'confirm' || shot === 'milan' ? PREVIEW_EXTRACT : null}
        initialMatch={shot === 'milan' ? PREVIEW_MATCH : null}
        focusResult={shot === 'milan'}
        embedded={embedded}
      />
    </>
  );
}
