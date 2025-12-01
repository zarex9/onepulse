import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import {
  BASE_CHAIN_ID,
  CELO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "@/lib/constants";

export function useTabsLogic() {
  const miniAppContext = useMiniAppContext();

  const isBaseApp = miniAppContext?.context?.client.clientFid === 309_857;

  const allowedChainIds = isBaseApp
    ? [BASE_CHAIN_ID, OPTIMISM_CHAIN_ID]
    : [BASE_CHAIN_ID, CELO_CHAIN_ID, OPTIMISM_CHAIN_ID];

  return {
    isBaseApp,
    allowedChainIds,
  };
}
