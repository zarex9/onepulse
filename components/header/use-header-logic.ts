import { useConnection } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import type { GmStats } from "@/hooks/use-gm-stats";
import { shouldShowShareButton } from "@/lib/share";
import type { MiniAppContext, UserContext } from "@/types/miniapp";

type UseHeaderLogicProps = {
  gmStats?: GmStats;
};

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

export const useHeaderLogic = ({ gmStats }: UseHeaderLogicProps) => {
  const { address } = useConnection();
  const miniAppContext = useMiniAppContext();

  const user = extractUserFromContext(miniAppContext?.context);
  const shouldShowUserInfo = !!user || !!address;

  const showShareButton = shouldShowShareButton(gmStats);

  return {
    address,
    user,
    shouldShowUserInfo,
    showShareButton,
  };
};
