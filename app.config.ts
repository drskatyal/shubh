import type { ExpoConfig } from 'expo/config';

const micPermission =
  'Shubh listens to your question so it can map the task onto today’s sky. Audio is sent to Gemini for that ask, then discarded.';

const config: ExpoConfig = {
  name: 'Shubh',
  slug: 'shubh',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'shubh',
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
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'RECORD_AUDIO', 'POST_NOTIFICATIONS'],
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
        icon: './assets/icon.png',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000',
    },
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
    REVENUECAT_API_KEY:
      process.env.REVENUECAT_API_KEY ?? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',
    TATHAASTU_API_KEY: process.env.TATHAASTU_API_KEY ?? '',
    TATHAASTU_PROXY_URL: process.env.TATHAASTU_PROXY_URL ?? '',
  },
};

export default config;
