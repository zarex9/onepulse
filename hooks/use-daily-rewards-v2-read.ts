import {
  useReadDailyRewardsV2BackendSigner,
  useReadDailyRewardsV2ClaimRewardAmount,
  useReadDailyRewardsV2DailyClaimLimit,
  useReadDailyRewardsV2DailyGmContract,
  useReadDailyRewardsV2GetVaultStatus,
  useReadDailyRewardsV2MinVaultBalance,
  useReadDailyRewardsV2Owner,
  useReadDailyRewardsV2PendingOwner,
  useReadDailyRewardsV2RewardToken,
} from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";
export function useDailyRewardsV2Read(chainId: ChainId) {
  const {
    data: backendSigner,
    isLoading: loadingBackendSigner,
    refetch: refetchBackendSigner,
  } = useReadDailyRewardsV2BackendSigner({
    chainId,
    query: { enabled: true },
  });

  const {
    data: rewardToken,
    isLoading: loadingRewardToken,
    refetch: refetchRewardToken,
  } = useReadDailyRewardsV2RewardToken({
    chainId,
    query: { enabled: true },
  });

  const {
    data: claimRewardAmount,
    isLoading: loadingClaimRewardAmount,
    refetch: refetchClaimRewardAmount,
  } = useReadDailyRewardsV2ClaimRewardAmount({
    chainId,
    query: { enabled: true },
  });

  const {
    data: minVaultBalance,
    isLoading: loadingMinVaultBalance,
    refetch: refetchMinVaultBalance,
  } = useReadDailyRewardsV2MinVaultBalance({
    chainId,
    query: { enabled: true },
  });

  const {
    data: dailyClaimLimit,
    isLoading: loadingDailyClaimLimit,
    refetch: refetchDailyClaimLimit,
  } = useReadDailyRewardsV2DailyClaimLimit({
    chainId,
    query: { enabled: true },
  });

  const {
    data: dailyGMContract,
    isLoading: loadingDailyGMContract,
    refetch: refetchDailyGMContract,
  } = useReadDailyRewardsV2DailyGmContract({
    chainId,
    query: { enabled: true },
  });

  const {
    data: vaultStatus,
    isLoading: loadingVaultStatus,
    refetch: refetchVaultStatus,
  } = useReadDailyRewardsV2GetVaultStatus({
    chainId,
    query: { enabled: true },
  });

  const {
    data: owner,
    isLoading: loadingOwner,
    refetch: refetchOwner,
  } = useReadDailyRewardsV2Owner({
    chainId,
    query: { enabled: true },
  });

  const {
    data: pendingOwner,
    isLoading: loadingPendingOwner,
    refetch: refetchPendingOwner,
  } = useReadDailyRewardsV2PendingOwner({
    chainId,
    query: { enabled: true },
  });

  const handleRefetch = () => {
    refetchBackendSigner?.();
    refetchRewardToken?.();
    refetchClaimRewardAmount?.();
    refetchMinVaultBalance?.();
    refetchDailyClaimLimit?.();
    refetchDailyGMContract?.();
    refetchVaultStatus?.();
    refetchOwner?.();
    refetchPendingOwner?.();
  };

  return {
    backendSigner,
    rewardToken,
    claimRewardAmount,
    minVaultBalance,
    dailyClaimLimit,
    dailyGMContract,
    vaultStatus: vaultStatus
      ? {
          currentBalance: vaultStatus[0],
          minReserve: vaultStatus[1],
          availableForClaims: vaultStatus[2],
        }
      : undefined,
    owner,
    pendingOwner,
    isLoading:
      loadingBackendSigner ||
      loadingRewardToken ||
      loadingClaimRewardAmount ||
      loadingMinVaultBalance ||
      loadingDailyClaimLimit ||
      loadingDailyGMContract ||
      loadingVaultStatus ||
      loadingOwner ||
      loadingPendingOwner,
    refetch: handleRefetch,
  };
}
