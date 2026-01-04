import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useState } from "react";
import type { GmStatsResult } from "@/hooks/use-gm-stats";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";

export const useHomePage = () => {
  const safeAreaStyle = useSafeAreaStyle();

  // Always start with "home" to avoid hydration mismatch
  const [tab, setTab] = useState("home");

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

  return {
    safeAreaStyle,
    tab,
    setTab,
  };
};

export const useContentLogic = () => {
  const [gmStats, setGmStats] = useState<GmStatsResult | null>(null);
  const [completedAllChains, setCompletedAllChains] = useState(false);

  // Memoize setGmStats to prevent infinite re-render loop
  const handleGmStatsChange = (stats: GmStatsResult) => {
    setGmStats((prev) => {
      // Only update if stats actually changed
      if (
        prev &&
        prev.isReady === stats.isReady &&
        JSON.stringify(prev.stats) === JSON.stringify(stats.stats)
      ) {
        return prev;
      }
      return stats;
    });
  };

  // Memoize setCompletedAllChains to prevent infinite re-render loop
  const handleAllDoneChange = (allDone: boolean) => {
    setCompletedAllChains((prev) => (prev === allDone ? prev : allDone));
  };

  return {
    gmStats,
    setGmStats: handleGmStatsChange,
    completedAllChains,
    setCompletedAllChains: handleAllDoneChange,
  };
};
