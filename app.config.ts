import type { ExpoConfig } from 'expo/config';

const micPermission =
  'Shubh listens to your question so it can map the task onto today’s sky. Audio is sent to Gemini for that ask, then discarded.';

const config: ExpoConfig = {
  name: 'Shubh',
  slug: 'shubh',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'shubh',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B1020',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ai.flowrad.shubh',
    infoPlist: {
      NSMicrophoneUsageDescription: micPermission,
    },
  },
  android: {
    package: 'ai.flowrad.shubh',
    adaptiveIcon: {
      backgroundColor: '#0B1020',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['RECORD_AUDIO'],
  },
  plugins: [
    [
      'expo-av',
      {
        microphonePermission: micPermission,
      },
    ],
  ],
  extra: {
    // EAS secret GEMINI_API_KEY is injected at build time. Never commit a key.
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
    REVENUECAT_API_KEY:
      process.env.REVENUECAT_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',
  },
};

export default config;
