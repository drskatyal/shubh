import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { isShotMode, readShotId } from '../preview/shot';
import { loadLanguage, saveLanguage } from '../storage/preferences';
import { STRINGS, type Copy, type Language } from './strings';

export type { Language };

type LanguageContextValue = {
  language: Language;
  ready: boolean;
  chosen: boolean;
  copy: Copy;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('hi');
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    if (isShotMode()) {
      setLanguageState('hi');
      setChosen(readShotId() !== 'firstopen');
      setReady(true);
      return;
    }
    loadLanguage().then((stored) => {
      if (stored) {
        setLanguageState(stored);
        setChosen(true);
      }
      setReady(true);
    });
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    setChosen(true);
    void saveLanguage(next);
  };

  const value = useMemo(
    () => ({
      language,
      ready,
      chosen,
      copy: STRINGS[language],
      setLanguage,
    }),
    [language, ready, chosen],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
}
