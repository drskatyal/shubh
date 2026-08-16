import type { ExpoConfig } from 'expo/config';

/** Keep in sync with src/store/aso.ts. Avoid importing TS from this CJS config. */
const playHiTitle = 'शुभ: पंचांग और कुंडली';
const playHiShort = 'आज का पंचांग, rahukaal, guna milan, muhurat';
const appleEnTitle = 'Shubh: Panchang & Kundli';
const storeScreenshots = [
  'feature-graphic.png',
  '01-milan-score-ring.png',
  '02-today-panchang.png',
  '03-marriage-muhurat.png',
];

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
  description: playHiShort,
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
      ITSAppUsesNonExemptEncryption: false,
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
      process.env.ASK_PROXY_URL ??
      process.env.EXPO_PUBLIC_DIVINE_PROXY_URL ??
      process.env.DIVINE_PROXY_URL ??
      '',
    SHUBH_DEV_UNLOCK: process.env.EXPO_PUBLIC_SHUBH_DEV_UNLOCK ?? '0',
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    store: {
      primary: 'play',
      defaultPlayLocale: 'hi-IN',
      playTitle: playHiTitle,
      appleTitle: appleEnTitle,
      featureGraphic: 'feature-graphic.png',
      screenshots: storeScreenshots,
    },
  },
};

export default config;
