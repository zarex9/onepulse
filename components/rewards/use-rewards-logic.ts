import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";

export function useRewardsLogic() {
  const { isConnected, address } = useAppKitAccount({ namespace: "eip155" });
  const miniAppContextData = useMiniAppContext();

  const fid = miniAppContextData?.context?.user?.fid
    ? BigInt(miniAppContextData.context.user.fid)
    : undefined;

  // Debug logging
  useEffect(() => {
    console.log("🔍 useRewardsLogic Debug:", {
      miniAppContextData,
      hasMiniAppContext: !!miniAppContextData,
      hasContext: !!miniAppContextData?.context,
      hasUser: !!miniAppContextData?.context?.user,
      rawFid: miniAppContextData?.context?.user?.fid,
      fid: fid?.toString(),
      isConnected,
      address,
    });
  }, [miniAppContextData, fid, isConnected, address]);

  return {
    isConnected,
    fid,
    address,
  };
}
