import { useAppKitAccount } from "@reown/appkit/react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useDisconnectLogic as useBaseDisconnectLogic } from "@/components/user-info/use-disconnect-logic";

export const useDisconnectWalletLogic = (onDisconnected?: () => void) => {
  const { isConnected } = useAppKitAccount({ namespace: "eip155" });
  const miniAppContextData = useMiniAppContext();
  const { disconnectWallet, isLoading } =
    useBaseDisconnectLogic(onDisconnected);

  const isInMiniApp = Boolean(miniAppContextData?.isInMiniApp);
  const shouldShowDisconnect = isConnected && !isInMiniApp;

  return {
    shouldShowDisconnect,
    disconnectWallet,
    isLoading,
  };
};
