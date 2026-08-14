import type { ExpoConfig } from 'expo/config';

import { STORE_SCREENSHOTS, appleEn, playEn } from './src/store/aso';

const micPermission =
  'Shubh listens so it can record both births or your ask. Audio is used once, then discarded.';

const config: ExpoConfig = {
  name: 'Shubh',
  slug: 'shubh',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'shubh',
  description: playEn.shortDescription,
  locales: {
    en: './store/locales/en.json',
    hi: './store/locales/hi.json',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ai.flowrad.shubh',
    entitlements: {
      'com.apple.security.application-groups': ['group.ai.flowrad.shubh'],
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Shubh uses your location only to compute local sunrise and today’s sky windows.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Shubh uses your location only to compute local sunrise and today’s sky windows.',
      NSMicrophoneUsageDescription: micPermission,
      NSUserNotificationsUsageDescription:
        'Shubh sends a local reminder for the next festival. No account.',
    },
    privacyManifests: {
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePreciseLocation',
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: [
            'NSPrivacyCollectedDataTypePurposeAppFunctionality',
          ],
        },
      ],
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
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
    predictiveBackGestureEnabled: false,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'RECORD_AUDIO',
      'POST_NOTIFICATIONS',
    ],
  },
  plugins: [
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Shubh uses your location only to compute local sunrise and today’s sky windows.',
      },
    ],
    './plugins/withPrivacyManifest',
    './plugins/withShubhWidgets',
    [
      'expo-av',
      {
        microphonePermission: micPermission,
      },
    ],
    [
      'expo-notifications',
      {
        sounds: [],
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-sharing',
  ],
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000',
    },
    REVENUECAT_API_KEY:
      process.env.REVENUECAT_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',
    DIVINE_PROXY_URL:
      process.env.EXPO_PUBLIC_DIVINE_PROXY_URL ?? process.env.DIVINE_PROXY_URL ?? '',
    ASK_PROXY_URL:
      process.env.EXPO_PUBLIC_ASK_PROXY_URL ??
      process.env.EXPO_PUBLIC_DIVINE_PROXY_URL ??
      process.env.DIVINE_PROXY_URL ??
      '',
    store: {
      appleTitle: appleEn.title,
      screenshots: STORE_SCREENSHOTS.map((shot) => shot.file),
    },
  },
};

export default config;
