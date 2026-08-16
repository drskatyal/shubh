/** True in the browser. Node tests and native stay false. */
export function isWebRuntime(): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;
  try {
    const { Platform } = require('react-native') as { Platform?: { OS?: string } };
    if (Platform?.OS && Platform.OS !== 'web') return false;
  } catch {
    // react-native may be absent in a pure unit test that still has jsdom.
  }
  return true;
}
