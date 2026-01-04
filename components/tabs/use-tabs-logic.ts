import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { BASE_CHAIN_ID } from "@/lib/constants";

const BASE_APP_CLIENT_FID = 309_857;

export function useTabsLogic() {
  const miniAppContext = useMiniAppContext();

  const isBaseApp =
    miniAppContext?.context?.client?.clientFid === BASE_APP_CLIENT_FID;

  const allowedChainIds = [BASE_CHAIN_ID];

  return {
    isBaseApp,
    allowedChainIds,
  };
}
