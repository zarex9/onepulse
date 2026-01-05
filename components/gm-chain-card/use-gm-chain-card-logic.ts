import { useState } from "react";
import { useChainId } from "wagmi";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { getChainBtnClasses, getChainIconName } from "@/lib/utils";
import { useGMState } from "./use-gm-state";

type UseGMChainCardLogicProps = {
  isConnected: boolean;
  address?: `0x${string}`;
};

type UseGMChainCardLogicReturn = {
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  chainBtnClasses: string;
  chainIconName: string;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
};

export function useGMChainCardLogic({
  isConnected,
  address,
}: UseGMChainCardLogicProps): UseGMChainCardLogicReturn {
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
