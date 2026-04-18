import { useState, useCallback, useEffect } from 'react';

export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void, () => void] {
  const [value, setValueState] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {}
    },
    [key],
  );

  const reset = useCallback(() => {
    setValueState(defaultValue);
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }, [key]);

  useEffect(() => {}, [defaultValue]);

  return [value, setValue, reset];
}