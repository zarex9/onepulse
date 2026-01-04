"use client";

import { useState } from "react";

/**
 * Manages per-chain GM status tracking
 * Returns statusMap and callback to update status
 */
export function usePerChainStatus() {
  const [statusMap, setStatusMap] = useState<
    Record<number, { hasGmToday: boolean }>
  >({});

  const handleStatus = (s: { chainId: number; hasGmToday: boolean }) => {
      setStatusMap((prev) => {
        if (prev[s.chainId]?.hasGmToday === s.hasGmToday) {
          return prev;
        }
        return {
          ...prev,
          [s.chainId]: { hasGmToday: s.hasGmToday },
        };
      });
    };

  return { statusMap, handleStatus };
}
