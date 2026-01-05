import { dailyGmAbi, dailyGmAddress } from "@/helpers/contracts";

export const useGMCalls = () => {
  return [
    {
      abi: dailyGmAbi,
      address: dailyGmAddress[8453],
      functionName: "gm" as const,
    },
  ];
};
