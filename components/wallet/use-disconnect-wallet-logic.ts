import { useConnection, useDisconnect } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";

export const useDisconnectWalletLogic = () => {
  const { isConnected } = useConnection();
  const miniAppContextData = useMiniAppContext();
  const disconnect = useDisconnect();

  const isInMiniApp = Boolean(miniAppContextData?.isInMiniApp);
  const shouldShowDisconnect = isConnected && !isInMiniApp;

  return {
    shouldShowDisconnect,
    disconnect,
    isLoading: disconnect.isPending,
  };
};
