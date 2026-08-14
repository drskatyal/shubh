import type { ExpoConfig } from 'expo/config';

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
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
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
  ],
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000',
    },
  },
};

export default config;
