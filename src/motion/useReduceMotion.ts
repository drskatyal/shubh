import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(override?: boolean): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (override !== undefined) {
      return;
    }
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) {
          setEnabled(value);
        }
      })
      .catch(() => {
        if (mounted) {
          setEnabled(false);
        }
      });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [override]);

  return override ?? enabled;
}
