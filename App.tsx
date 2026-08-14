import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from './src/home/HomeScreen';
import { LanguageGate } from './src/home/LanguageGate';
import { LanguageProvider } from './src/i18n/language';

export default function App() {
  return (
    <LanguageProvider>
      <LanguageGate>
        <HomeScreen />
      </LanguageGate>
      <StatusBar style="light" />
    </LanguageProvider>
  );
}
