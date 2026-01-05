import { useState } from "react";
import { useChainId } from "wagmi";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { getChainBtnClasses, getChainIconName } from "@/lib/utils";
import { useGMState } from "./use-gm-state";

type UseGMChainCardLogicProps = {
  isConnected: boolean;
  address?: `0x${string}`;
};

export function useGMChainCardLogic({
  isConnected,
  address,
}: UseGMChainCardLogicProps) {
  const currentChainId = useChainId();
  const onCorrectChain = currentChainId === BASE_CHAIN_ID;
  const [processing, setProcessing] = useState(false);

  const { hasGmToday, gmDisabled } = useGMState(isConnected, address);

  const chainBtnClasses = getChainBtnClasses();

  const chainIconName = getChainIconName();

  return {
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    chainIconName,
    processing,
    setProcessing,
  };
}
