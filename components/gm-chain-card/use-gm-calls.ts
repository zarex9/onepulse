import { dailyGmAbi } from "@/helpers/contracts";

type UseGMCallsParams = {
  contractAddress: `0x${string}`;
};

export const useGMCalls = ({ contractAddress }: UseGMCallsParams) => {
  return [
    {
      abi: dailyGmAbi,
      address: contractAddress,
      functionName: "gm" as const,
    },
  ];
};
