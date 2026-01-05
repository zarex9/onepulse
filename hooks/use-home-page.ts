import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useState } from "react";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";

type UseHomePageReturn = {
  safeAreaStyle: Record<string, number>;
  tab: string;
  setTab: (tab: string) => void;
};

export function useHomePage(): UseHomePageReturn {
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
}
