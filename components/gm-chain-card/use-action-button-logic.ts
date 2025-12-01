import { useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useMemo } from "react";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import {
  ERROR_MESSAGES,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
import { networks } from "@/lib/wagmi";

type UseActionButtonLogicProps = {
  chainId: number;
  gmDisabled: boolean;
  onOpenModal: () => void;
};

export function useActionButtonLogic({
  chainId,
  gmDisabled,
  onOpenModal,
}: UseActionButtonLogicProps) {
  const { switchNetwork } = useAppKitNetwork();
  const targetNetwork = useMemo(
    () => networks.find((net) => net.id === chainId),
    [chainId]
  );

  const op = useCallback(() => {
    if (!targetNetwork) {
      return Promise.reject(new Error(`Network ${chainId} not supported`));
    }
    return switchNetwork(targetNetwork);
  }, [switchNetwork, targetNetwork, chainId]);

  const options = useMemo(
    () => ({
      loadingMessage: LOADING_MESSAGES.NETWORK_SWITCHING,
      successMessage: SUCCESS_MESSAGES.NETWORK_SWITCHED,
      errorMessage: ERROR_MESSAGES.NETWORK_SWITCH,
      context: { operation: "network-switch", chainId },
    }),
    [chainId]
  );

  const { execute: doSwitch, isLoading } = useAsyncOperation(op, options);

  const handleOpenModal = useCallback(() => {
    if (!gmDisabled) {
      onOpenModal();
    }
  }, [gmDisabled, onOpenModal]);

  return {
    doSwitch,
    isLoading,
    handleOpenModal,
  };
}
