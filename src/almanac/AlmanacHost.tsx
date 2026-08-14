import type { Copy, Language } from '../i18n/strings';
import type { City } from '../location/cities';
import { CalendarScreen } from '../calendar/CalendarScreen';
import { FestivalsScreen } from '../festivals/FestivalsScreen';
import { MuhuratScreen } from '../muhurat/MuhuratScreen';
import type { AlmanacTab } from './AlmanacDock';

export function AlmanacHost({
  tab,
  onClose,
  city,
  language,
  copy,
}: {
  tab: AlmanacTab | null;
  onClose: () => void;
  city: City | null;
  language: Language;
  copy: Copy;
}) {
  return (
    <>
      <MuhuratScreen visible={tab === 'muhurat'} onClose={onClose} city={city} language={language} copy={copy} />
      <FestivalsScreen visible={tab === 'festivals'} onClose={onClose} city={city} language={language} copy={copy} />
      <CalendarScreen visible={tab === 'calendar'} onClose={onClose} city={city} language={language} copy={copy} />
    </>
  );
}
