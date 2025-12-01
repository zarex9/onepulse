import { useDisconnect } from "@reown/appkit/react";
import { useCallback, useMemo } from "react";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";

export const useDisconnectLogic = (onSuccess?: () => void) => {
  const { disconnect } = useDisconnect();

  const op = useCallback(
    () => disconnect({ namespace: "eip155" }),
    [disconnect]
  );

  const options = useMemo(
    () => ({
      loadingMessage: LOADING_MESSAGES.WALLET_DISCONNECTING,
      successMessage: SUCCESS_MESSAGES.WALLET_DISCONNECTED,
      errorMessage: ERROR_MESSAGES.WALLET_DISCONNECT,
      context: { operation: "dropdown-disconnect" },
      onSuccess,
    }),
    [onSuccess]
  );

  const { execute: disconnectWallet, isLoading } = useAsyncOperation(
    op,
    options
  );

  return { disconnectWallet, isLoading };
};
