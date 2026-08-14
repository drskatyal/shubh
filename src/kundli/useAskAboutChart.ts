import { useCallback, useState } from 'react';

import type { ChartAskSummary } from '../tathaastu/types';

/**
 * Chart ask stays cold until the user taps. Generating a kundli does not arm Gemini.
 */
export function useAskAboutChart() {
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [summary, setSummary] = useState<ChartAskSummary | null>(null);

  const openFromTap = useCallback((next: ChartAskSummary) => {
    setSummary(next);
    setArmed(true);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return { armed, visible, summary, openFromTap, close };
}
