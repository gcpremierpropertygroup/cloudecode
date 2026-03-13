import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  target: number;
  decimals?: number;   // e.g. 1 for "5.0", 0 for integers
  duration?: number;   // milliseconds, default 1500
  active?: boolean;    // set to false to skip animation (reduced motion or not yet in view)
}

export function useCountUp({
  target,
  decimals = 0,
  duration = 1500,
  active = true,
}: UseCountUpOptions): string {
  // If active on mount, start at 0; otherwise show target immediately (avoids 0-flash for reduced-motion users)
  const [value, setValue] = useState(() => (active ? 0 : target));
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      // Show final value immediately (reduced motion or pre-trigger state)
      setValue(target);
      return;
    }

    // Reset and animate from 0
    setValue(0);
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      // clamp elapsed to prevent jump-to-end if user tabs away and returns
      const elapsed = Math.min(timestamp - startTimeRef.current, duration);
      const progress = elapsed / duration;
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setValue(parseFloat(current.toFixed(decimals)));

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, decimals, duration, active]);

  return value.toFixed(decimals);
}
