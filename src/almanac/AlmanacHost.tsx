import type { CreditWallet } from '../billing/credits';
import { CalendarScreen } from '../calendar/CalendarScreen';
import { FestivalsScreen } from '../festivals/FestivalsScreen';
import type { Copy, Language } from '../i18n/strings';
import { KundliScreen, MatchingScreen } from '../kundli';
import type { City } from '../location/cities';
import { MuhuratScreen } from '../muhurat/MuhuratScreen';
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
  onBuyPack,
  onRestore,
}: {
  tab: AlmanacTab | null;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
  wallet: CreditWallet | null;
  onRemainingChange?: (remaining: number) => void;
  onBuyMonthly?: () => Promise<void>;
  onBuyPack?: () => Promise<void>;
  onRestore?: () => Promise<void>;
}) {
  return (
    <>
      <MuhuratScreen
        visible={tab === 'muhurat'}
        onClose={onClose}
        city={city}
        language={language}
        copy={copy}
      />
      <FestivalsScreen
        visible={tab === 'festivals'}
        onClose={onClose}
        city={city}
        language={language}
        copy={copy}
      />
      <CalendarScreen
        visible={tab === 'calendar'}
        onClose={onClose}
        city={city}
        language={language}
        copy={copy}
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
        onBuyPack={onBuyPack}
        onRestore={onRestore}
      />
      <MatchingScreen
        visible={tab === 'match'}
        onClose={onClose}
        copy={copy}
        language={language}
        defaultCity={city}
      />
    </>
  );
}
