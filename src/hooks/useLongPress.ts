import { useCallback, useRef } from "react";

export function useLongPress(callback: () => void, duration = 200) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      callback();
    }, duration);
  }, [callback, duration]);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clear();
      if (firedRef.current) {
        e.preventDefault();
      }
    },
    [clear],
  );

  const onTouchMove = useCallback(() => {
    clear();
  }, [clear]);

  const onTouchCancel = useCallback(() => {
    clear();
    firedRef.current = false;
  }, [clear]);

  return { onTouchStart, onTouchEnd, onTouchMove, onTouchCancel };
}
