import { useConnection } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import type { MiniAppContext, UserContext } from "@/types/miniapp";

function extractUserFromContext(
  context: MiniAppContext | null | undefined
): UserContext | undefined {
  if (!context?.user) {
    return undefined;
  }
  return {
    fid: context.user.fid,
    displayName: context.user.displayName,
    username: context.user.username,
    pfpUrl: context.user.pfpUrl,
  };
}

type UseHeaderLogicReturn = {
  address: `0x${string}` | undefined;
  user: UserContext | undefined;
  shouldShowUserInfo: boolean;
};

export function useHeaderLogic(): UseHeaderLogicReturn {
  const { address } = useConnection();
  const miniAppContext = useMiniAppContext();

  const user = extractUserFromContext(miniAppContext?.context);
  const shouldShowUserInfo = !!user || !!address;

  return {
    address,
    user,
    shouldShowUserInfo,
  };
}
