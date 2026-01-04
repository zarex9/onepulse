"use client";

import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import type { useGmStats } from "@/hooks/use-gm-stats";
import { BASE_CHAIN_ID, type ChainId, DAILY_GM_ADDRESS } from "@/lib/constants";
import { Countdown } from "./countdown";
import { useHomeLogic } from "./home/use-home-logic";

export const Home = ({
  sponsored,
  allowedChainIds,
  onGmStatsChangeAction,
}: {
  sponsored?: boolean;
  allowedChainIds?: ChainId[];
  onGmStatsChangeAction?: (stats: ReturnType<typeof useGmStats>) => void;
}) => {
  const { isConnected, address, gmStatsResult } = useHomeLogic({
    allowedChainIds,
    onGmStatsChange: onGmStatsChangeAction,
  });

  return (
    <div className="my-12 space-y-4">
      <Countdown />

      <GMChainCard
        address={address}
        chainId={BASE_CHAIN_ID}
        contractAddress={DAILY_GM_ADDRESS}
        isConnected={isConnected}
        isSponsored={sponsored}
        isStatsReady={gmStatsResult.isReady}
        name="Base"
        stats={gmStatsResult.stats}
      />
    </div>
  );
};

Home.displayName = "Home";
