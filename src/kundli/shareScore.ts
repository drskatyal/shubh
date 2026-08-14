import { Share } from 'react-native';

import type { Language } from '../i18n/strings';
import type { NormalizedMatch } from '../tathaastu/types';
import { formatScoreCardText } from './formatScoreCard';

export { formatScoreCardText };

export async function shareScoreCard(
  match: NormalizedMatch,
  language: Language,
  shareImpl: typeof Share.share = Share.share.bind(Share),
): Promise<void> {
  const message = formatScoreCardText(match, language);
  await shareImpl({
    title: language === 'hi' ? 'गुण अंक' : 'Guna score',
    message,
  });
}
