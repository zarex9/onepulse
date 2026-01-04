import { base } from "@wagmi/core/chains";
import { useReadDailyRewardsV2Owner } from "@/helpers/contracts";

export function useContractOwner() {
  const { data: owner, isLoading } = useReadDailyRewardsV2Owner({
    chainId: base.id,
    query: {
      enabled: true,
    },
  });

  return {
    owner,
    isLoading,
  };
}
