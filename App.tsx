import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from './src/home/HomeScreen';
import { LanguageGate } from './src/home/LanguageGate';
import { LanguageProvider } from './src/i18n/language';
import { SkyLayerProvider } from './src/motion';

export default function App() {
  return (
    <LanguageProvider>
      <SkyLayerProvider>
        <LanguageGate>
          <HomeScreen />
        </LanguageGate>
        <StatusBar style="light" />
      </SkyLayerProvider>
    </LanguageProvider>
  );
}
