import { useConnection } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import type { MiniAppContext, UserContext } from "@/types/miniapp";

const extractUserFromContext = (
  context: MiniAppContext | null | undefined
): UserContext | undefined =>
  context?.user
    ? {
        fid: context.user.fid,
        displayName: context.user.displayName,
        username: context.user.username,
        pfpUrl: context.user.pfpUrl,
      }
    : undefined;

export const useHeaderLogic = () => {
  const { address } = useConnection();
  const miniAppContext = useMiniAppContext();

  const user = extractUserFromContext(miniAppContext?.context);
  const shouldShowUserInfo = !!user || !!address;

  return {
    address,
    user,
    shouldShowUserInfo,
  };
};
