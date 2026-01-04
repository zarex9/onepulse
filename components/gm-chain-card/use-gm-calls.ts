import type { Address } from "viem/accounts";
import { isAddress } from "viem/utils";
import { dailyGmAbi } from "@/helpers/contracts";

type UseGMCallsParams = {
  contractAddress: Address;
  transactionType: "gm" | "gmTo";
  recipient?: string;
};

export const useGMCalls = ({
  contractAddress,
  transactionType,
  recipient,
}: UseGMCallsParams) => {
  if (transactionType === "gm") {
    return [
      {
        abi: dailyGmAbi,
        address: contractAddress,
        functionName: "gm" as const,
      },
    ];
  }

  const hasValidRecipient = recipient && isAddress(recipient);
  if (transactionType !== "gmTo" || !hasValidRecipient) {
    return [];
  }

  return [
    {
      abi: dailyGmAbi,
      address: contractAddress,
      functionName: "gmTo" as const,
      args: [recipient as Address],
    },
  ];
};
