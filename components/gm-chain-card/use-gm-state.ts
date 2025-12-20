import type { Address } from "viem";
import { useReadContract } from "wagmi";
import type { Chain } from "@/components/home/chain-config";
import { dailyGMAbi } from "@/lib/abi/daily-gm";
import { getCurrentTimestampSeconds, timestampToDayNumber } from "@/lib/utils";

type ComputeGMStateParams = {
  address: Address | undefined;
  contractAddress: Address;
  isConnected: boolean;
  lastGmDayData: unknown;
  isPendingLastGm: boolean;
};

type GMState = {
  hasGmToday: boolean;
  gmDisabled: boolean;
};

const computeGMState = (params: ComputeGMStateParams): GMState => {
  const {
    address,
    contractAddress,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  } = params;

  if (!(address && contractAddress)) {
    return { hasGmToday: false, gmDisabled: !isConnected };
  }

  if (lastGmDayData === undefined) {
    return { hasGmToday: false, gmDisabled: true };
  }

  if (typeof lastGmDayData !== "bigint") {
    return { hasGmToday: false, gmDisabled: true };
  }

  const lastDay = Number(lastGmDayData);
  const nowSec = getCurrentTimestampSeconds();
  const currentDay = timestampToDayNumber(nowSec);
  const alreadyGmToday = lastDay >= currentDay;

  return {
    hasGmToday: alreadyGmToday,
    gmDisabled: alreadyGmToday || isPendingLastGm,
  };
};

export const useGMState = (
  chainId: Chain["id"],
  contractAddress: Address,
  address: string | undefined,
  isConnected: boolean
) => {
  const {
    data: lastGmDayData,
    isPending: isPendingLastGm,
    refetch: refetchLastGmDay,
  } = useReadContract({
    chainId,
    abi: dailyGMAbi,
    address: contractAddress,
    functionName: "lastGMDay",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address && contractAddress) },
  });

  const { hasGmToday, gmDisabled } = computeGMState({
    address: address as Address | undefined,
    contractAddress,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  });

  return {
    hasGmToday,
    gmDisabled,
    refetchLastGmDay,
  };
};
