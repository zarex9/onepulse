import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SECONDS_PER_DAY } from "@/lib/constants";
import { getCurrentTimestampSeconds, timestampToDayNumber } from "@/lib/utils";

export const useCountdown = () => {
  const [text, setText] = useState("--:--:--");
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [currentDay, setCurrentDay] = useState(() =>
    timestampToDayNumber(getCurrentTimestampSeconds())
  );

  const targetSec = useMemo(
    () => (currentDay + 1) * SECONDS_PER_DAY,
    [currentDay]
  );

  const format = useCallback((ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, []);

  useEffect(() => {
    const currentSec = getCurrentTimestampSeconds();
    const nextMidnight = (currentDay + 1) * SECONDS_PER_DAY;
    const msUntilMidnight = (nextMidnight - currentSec) * 1000;

    const midnightTimer = setTimeout(() => {
      setCurrentDay(timestampToDayNumber(getCurrentTimestampSeconds()));
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [currentDay]);

  useEffect(() => {
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const ms = Math.max(0, (targetSec - nowSec) * 1000);
      setText(format(ms));
    };

    rafRef.current = window.requestAnimationFrame(() => update());
    intervalRef.current = window.setInterval(update, 1000);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetSec, format]);

  return text;
};
