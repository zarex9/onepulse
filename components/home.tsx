"use client";

import dynamic from "next/dynamic";
import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import type { useGmStats } from "@/hooks/use-gm-stats";
import { BASE_CHAIN_ID, type ChainId, DAILY_GM_ADDRESS } from "@/lib/constants";
import { Countdown } from "./countdown";
import { useHomeLogic } from "./home/use-home-logic";

const CongratsDialog = dynamic(
  () => import("./home/congrats-dialog").then((mod) => mod.CongratsDialog),
  { ssr: false }
);

export const Home = ({
  sponsored,
  allowedChainIds,
  onGmStatsChangeAction,
  onShareClickAction,
  onAllDoneChangeAction,
}: {
  sponsored?: boolean;
  allowedChainIds?: ChainId[];
  onGmStatsChangeAction?: (stats: ReturnType<typeof useGmStats>) => void;
  onShareClickAction?: () => void;
  onAllDoneChangeAction?: (allDone: boolean) => void;
}) => {
  const {
    isConnected,
    address,
    gmStatsResult,
    handleStatus,
    showCongrats,
    setShowCongrats,
  } = useHomeLogic({
    allowedChainIds,
    onGmStatsChange: onGmStatsChangeAction,
    onAllDoneChange: onAllDoneChangeAction,
  });

  return (
    <div className="my-12 space-y-4">
      <Countdown />

      <GMChainCard
        address={address}
        chainId={BASE_CHAIN_ID}
        contractAddress={DAILY_GM_ADDRESS}
        isConnected={Boolean(isConnected)}
        isSponsored={sponsored}
        isStatsReady={gmStatsResult.isReady}
        name="Base"
        onStatusChangeAction={handleStatus}
        stats={gmStatsResult.stats}
      />

      <CongratsDialog
        isStatsReady={gmStatsResult?.isReady}
        onOpenChangeAction={setShowCongrats}
        onShareClickAction={onShareClickAction}
        open={showCongrats}
      />
    </div>
  );
};

Home.displayName = "Home";
