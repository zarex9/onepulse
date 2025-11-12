"use client";

import { useCallback, useState } from "react";

/**
 * Manages per-chain GM status tracking
 * Returns statusMap and callback to update status
 */
export function usePerChainStatus() {
  const [statusMap, setStatusMap] = useState<
    Record<number, { hasGmToday: boolean; targetSec: number }>
  >({});

  const handleStatus = useCallback(
    (s: { chainId: number; hasGmToday: boolean; targetSec: number }) => {
      setStatusMap((prev) => {
        if (
          prev[s.chainId]?.hasGmToday === s.hasGmToday &&
          prev[s.chainId]?.targetSec === s.targetSec
        ) {
          return prev;
        }
        return {
          ...prev,
          [s.chainId]: { hasGmToday: s.hasGmToday, targetSec: s.targetSec },
        };
      });
    },
    []
  );

  return { statusMap, handleStatus };
}
