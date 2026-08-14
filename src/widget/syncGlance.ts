import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGlanceNative } from 'shubh-glance';

import { buildGlance, type GlancePayload } from './buildGlance';

const GLANCE_KEY = 'shubh.widget.glance';

/**
 * Persist city + window + now/wait for the home-screen widget.
 * Native module is attached at EAS prebuild; Expo Go stores locally only.
 */
export async function syncGlance(input: GlancePayload): Promise<void> {
  const payload = buildGlance(input);
  const json = JSON.stringify(payload);
  await AsyncStorage.setItem(GLANCE_KEY, json);
  const bridge = getGlanceNative();
  if (bridge) {
    await bridge.writeGlance(json);
  }
}
