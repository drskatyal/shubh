import type { ExpoConfig } from 'expo/config';

const shell = require('./app.json') as { expo: ExpoConfig };

const micPermission =
  'Shubh listens to your question so it can map the task onto today’s sky. Audio is sent to Gemini for that ask, then discarded.';

const config: ExpoConfig = {
  ...shell.expo,
  ios: {
    ...shell.expo.ios,
    bundleIdentifier: 'ai.flowrad.shubh',
    infoPlist: {
      NSMicrophoneUsageDescription: micPermission,
    },
  },
  android: {
    ...shell.expo.android,
    package: 'ai.flowrad.shubh',
    permissions: ['RECORD_AUDIO'],
  },
  plugins: [
    ...(shell.expo.plugins ?? []),
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
