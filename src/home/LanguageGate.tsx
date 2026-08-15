import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useLanguage } from '../i18n/language';

/** Waits for stored language. First-open city + language lives on Home. */
export function LanguageGate({ children }: { children: ReactNode }) {
  const { ready } = useLanguage();
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
  }
  return <>{children}</>;
}
