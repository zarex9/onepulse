import { useAppKit } from "@reown/appkit/react";
import { useCallback } from "react";

export const useConnectWalletLogic = () => {
  const { open } = useAppKit();

  const connectWallet = useCallback(() => {
    open({ view: "Connect", namespace: "eip155" });
  }, [open]);

  return {
    connectWallet,
  };
};
