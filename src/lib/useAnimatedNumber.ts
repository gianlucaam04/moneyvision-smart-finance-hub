import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Eases a displayed number toward `target`. The first render returns the
 * target itself, so the pre-rendered HTML and the hydrated page agree and no
 * visitor ever sees a count-up from zero on load. Only later changes animate,
 * and never under `prefers-reduced-motion`.
 */
export function useAnimatedNumber(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const frame = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion() || current.current === target) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic, as in the app
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}
