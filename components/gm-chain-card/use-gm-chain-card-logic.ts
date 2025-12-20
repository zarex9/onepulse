import { useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useEffect, useMemo } from "react";
import type { Address } from "viem";
import {
  getChainBtnClasses,
  getChainIconName,
  normalizeChainId,
} from "@/lib/utils";
import { useGMState } from "./use-gm-state";

type UseGMChainCardLogicProps = {
  chainId: number;
  contractAddress: Address;
  isConnected: boolean;
  address?: string;
  onStatusChange?: (status: { chainId: number; hasGmToday: boolean }) => void;
  onOpenModal?: (refetch: () => Promise<unknown>) => void;
};

export function useGMChainCardLogic({
  chainId,
  contractAddress,
  isConnected,
  address,
  onStatusChange,
  onOpenModal,
}: UseGMChainCardLogicProps) {
  const { chainId: currentChainId } = useAppKitNetwork();
  const numericChainId = normalizeChainId(currentChainId);
  const onCorrectChain = numericChainId === chainId;

  const { hasGmToday, gmDisabled, refetchLastGmDay } = useGMState(
    chainId,
    contractAddress,
    address,
    isConnected
  );

  useEffect(() => {
    onStatusChange?.({ chainId, hasGmToday });
  }, [chainId, hasGmToday, onStatusChange]);

  const chainBtnClasses = useMemo(() => getChainBtnClasses(chainId), [chainId]);

  const chainIconName = useMemo(() => getChainIconName(chainId), [chainId]);

  const handleOpenModal = useCallback(() => {
    if (onOpenModal) {
      onOpenModal(refetchLastGmDay);
    }
  }, [onOpenModal, refetchLastGmDay]);

  return {
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    chainIconName,
    handleOpenModal,
  };
}
