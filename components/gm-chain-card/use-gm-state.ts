import { useReadDailyGmLastGmDay } from "@/helpers/contracts";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { getCurrentTimestampSeconds, timestampToDayNumber } from "@/lib/utils";

type ComputeGMStateParams = {
  address?: `0x${string}`;
  isConnected: boolean;
  lastGmDayData: unknown;
  isPendingLastGm: boolean;
};

type GMState = {
  hasGmToday: boolean;
  gmDisabled: boolean;
};

const computeGMState = (params: ComputeGMStateParams): GMState => {
  const { address, isConnected, lastGmDayData, isPendingLastGm } = params;

  if (!address) {
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

export function useGMState(
  isConnected: boolean,
  address?: `0x${string}`
): GMState {
  const { data: lastGmDayData, isPending: isPendingLastGm } =
    useReadDailyGmLastGmDay({
      chainId: BASE_CHAIN_ID,
      args: address ? [address] : undefined,
      query: { enabled: Boolean(address) },
    });

  const { hasGmToday, gmDisabled } = computeGMState({
    address,
    isConnected,
    lastGmDayData,
    isPendingLastGm,
  });

  return {
    hasGmToday,
    gmDisabled,
  };
}
