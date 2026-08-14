export function tapHaptic(): void {
  try {
    const Haptics = require('expo-haptics') as {
      impactAsync?: (style: string) => Promise<void>;
      ImpactFeedbackStyle?: { Light: string };
    };
    void Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light ?? 'light');
  } catch {
    // Native haptics are optional in tests and Expo Go gaps.
  }
}
