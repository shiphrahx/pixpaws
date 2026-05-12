import { useState, useCallback, useRef, useEffect } from 'react';

export function useDebounced(initial, delay) {
  const [raw, setRaw] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const timer = useRef(null);

  const set = useCallback((v) => {
    setRaw(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(v), delay);
  }, [delay]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [raw, debounced, set];
}
