import { useEffect, useRef } from 'react';
import type { Input } from './types';

const KEY_BINDINGS: Record<string, keyof Input> = {
  KeyW: 'leftUp',
  KeyS: 'leftDown',
  ArrowUp: 'rightUp',
  ArrowDown: 'rightDown',
};

export function useKeyboardInput(options: {
  onSpace?: () => void;
}) {
  const inputRef = useRef<Input>({
    leftUp: false,
    leftDown: false,
    rightUp: false,
    rightDown: false,
  });

  const onSpaceRef = useRef(options.onSpace);
  onSpaceRef.current = options.onSpace;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onSpaceRef.current?.();
        return;
      }

      const action = KEY_BINDINGS[e.code];
      if (action) {
        e.preventDefault();
        inputRef.current[action] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = KEY_BINDINGS[e.code];
      if (action) {
        inputRef.current[action] = false;
      }
    };

    const handleBlur = () => {
      inputRef.current = {
        leftUp: false, leftDown: false,
        rightUp: false, rightDown: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return inputRef;
}