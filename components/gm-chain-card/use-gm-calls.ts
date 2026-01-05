import { dailyGmAbi, dailyGmAddress } from "@/helpers/contracts";

type GMCall = {
  abi: typeof dailyGmAbi;
  address: `0x${string}`;
  functionName: "gm";
};

export function useGMCalls(): GMCall[] {
  return [
    {
      abi: dailyGmAbi,
      address: dailyGmAddress[8453],
      functionName: "gm" as const,
    },
  ];
}
