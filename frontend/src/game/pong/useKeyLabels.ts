import { useEffect, useState } from 'react';

type KeyLabels = {
  leftUp: string;
  leftDown: string;
  rightUp: string;
  rightDown: string;
};

const DEFAULT_LABELS: KeyLabels = {
  leftUp: 'W',
  leftDown: 'S',
  rightUp: '↑',
  rightDown: '↓',
};

export function useKeyLabels(): KeyLabels {
  const [labels, setLabels] = useState<KeyLabels>(DEFAULT_LABELS);

  useEffect(() => {
    const nav = navigator as Navigator & {
      keyboard?: { getLayoutMap?: () => Promise<Map<string, string>> };
    };

    const applyFromMap = (map: Map<string, string>) => {
      const leftUp = map.get('KeyW')?.toUpperCase() ?? 'W';
      const leftDown = map.get('KeyS')?.toUpperCase() ?? 'S';
      setLabels({
        leftUp,
        leftDown,
        rightUp: '↑',
        rightDown: '↓',
      });
    };

    if (nav.keyboard?.getLayoutMap) {
      nav.keyboard
        .getLayoutMap()
        .then(applyFromMap)
        .catch(() => {
          fallbackByLanguage();
        });
    } else {
      fallbackByLanguage();
    }

    function fallbackByLanguage() {
      const lang = (navigator.language || '').toLowerCase();
      if (lang.startsWith('fr')) {
        setLabels({
          leftUp: 'Z',
          leftDown: 'S',
          rightUp: '↑',
          rightDown: '↓',
        });
      }
    }
  }, []);

  return labels;
}