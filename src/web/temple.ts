import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import { isTempleWidth } from './layout';
import { isWebRuntime } from './platform';

export { isTempleWidth, TEMPLE_MIN_WIDTH } from './layout';

export function useTempleLayout(): { temple: boolean; width: number } {
  const [width, setWidth] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });
    return () => sub.remove();
  }, []);

  return { temple: isWebRuntime() && isTempleWidth(width), width };
}
