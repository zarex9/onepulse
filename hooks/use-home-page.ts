import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useMemo, useState } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useGMSharing } from "@/hooks/use-gm-sharing";
import type { GmStatsResult } from "@/hooks/use-gm-stats";
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow";
import { useMiniAppInitialization } from "@/hooks/use-miniapp-initialization";
import { useOnboardingModal } from "@/hooks/use-onboarding-modal";
import { usePageState } from "@/hooks/use-page-state";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";
import { useShareActions } from "@/hooks/use-share-actions";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";
import { canSaveMiniApp } from "@/lib/utils";
import { useClaimEligibility } from "./use-reward-claim";

export const useHomePage = () => {
  const miniAppContextData = useMiniAppContext();
  const { inMiniApp } = usePageState();
  const safeAreaStyle = useSafeAreaStyle();
  const { handleMiniAppAdded } = useMiniAppFlow();
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal();
  const [tab, setTab] = useState("home");

  // Call useMiniKit once and pass to initialization hook
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  useMiniAppInitialization({ isMiniAppReady, setMiniAppReady });

  const clientAdded = miniAppContextData?.context?.client?.added ?? false;

  const onboardingSaveHandler = useMemo(() => {
    const shouldEnableSave = canSaveMiniApp({
      isMiniAppReady,
      inMiniApp,
      clientAdded,
    });
    return shouldEnableSave ? handleMiniAppAdded : undefined;
  }, [isMiniAppReady, inMiniApp, clientAdded, handleMiniAppAdded]);

  return useMemo(
    () => ({
      inMiniApp,
      safeAreaStyle,
      handleMiniAppAdded,
      shouldShowOnboarding,
      dismissOnboarding,
      canSaveApp,
      tab,
      setTab,
      isMiniAppReady,
      onboardingSaveHandler,
    }),
    [
      inMiniApp,
      safeAreaStyle,
      handleMiniAppAdded,
      shouldShowOnboarding,
      dismissOnboarding,
      canSaveApp,
      tab,
      isMiniAppReady,
      onboardingSaveHandler,
    ]
  );
};

export const useContentLogic = () => {
  const [gmStats, setGmStats] = useState<GmStatsResult | null>(null);
  const [completedAllChains, setCompletedAllChains] = useState(false);
  const miniAppContextData = useMiniAppContext();
  const fidRaw = miniAppContextData?.context?.user?.fid;
  const fid = fidRaw !== undefined ? BigInt(fidRaw) : undefined;

  const baseEligibility = useClaimEligibility({
    fid,
    chainId: BASE_CHAIN_ID,
    enabled: Boolean(fid),
  });
  const celoEligibility = useClaimEligibility({
    fid,
    chainId: CELO_CHAIN_ID,
    enabled: Boolean(fid),
  });
  const optimismEligibility = useClaimEligibility({
    fid,
    chainId: OPTIMISM_CHAIN_ID,
    enabled: Boolean(fid),
  });

  const claimedToday = Boolean(
    baseEligibility.claimStatus?.fidClaimedToday ||
      celoEligibility.claimStatus?.fidClaimedToday ||
      optimismEligibility.claimStatus?.fidClaimedToday
  );

  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains
  );
  const { shareToCast } = useShareActions();
  const shareNow = useCallback(async () => {
    if (!shareUrl) {
      return;
    }
    await shareToCast(shareText, shareUrl);
  }, [shareText, shareUrl, shareToCast]);

  return useMemo(
    () => ({
      gmStats,
      setGmStats,
      completedAllChains,
      setCompletedAllChains,
      shareNow,
    }),
    [gmStats, completedAllChains, shareNow]
  );
};
