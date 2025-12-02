"use client";

import { memo } from "react";
import { useCountdown } from "./use-countdown";

type CountdownTextProps = {
  targetSec: number;
};

export const CountdownText = memo(({ targetSec }: CountdownTextProps) => {
  const text = useCountdown(targetSec);
  return <>{text}</>;
});
