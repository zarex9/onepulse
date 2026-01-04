import { useConnection } from "wagmi";
import type { useGmStats } from "@/hooks/use-gm-stats";
import type { ChainId } from "@/lib/constants";
import { getChainList } from "./chain-config";
import { useHomeStats } from "./use-home-stats";

type UseHomeLogicProps = {
  allowedChainIds?: ChainId[];
  onGmStatsChange?: (stats: ReturnType<typeof useGmStats>) => void;
};

export const useHomeLogic = ({
  allowedChainIds,
  onGmStatsChange,
}: UseHomeLogicProps) => {
  const { isConnected, address } = useConnection();

  const chains = getChainList(allowedChainIds);

  const gmStatsResult = useHomeStats(address, chains, onGmStatsChange);

  return {
    isConnected,
    address,
    gmStatsResult,
  };
};
