"use client";

import type { Address } from "viem/accounts";
import { formatUnits, isAddress } from "viem/utils";
import { useDailyRewardsV2Config } from "@/hooks/use-daily-rewards-v2-config";
import { useDailyRewardsV2Read } from "@/hooks/use-daily-rewards-v2-read";
import { useErc20Metadata } from "@/hooks/use-erc20-metadata";
import { ContractSettingsCard } from "./contract-settings-card";
import { VaultStatusCard } from "./vault-status-card";

type ContractOverviewProps = {
  chainName: string;
  currentTokenDecimals: number;
  currentTokenSymbol: string;
  currentBalance: bigint | undefined;
  claimRewardAmount: bigint | undefined;
  minVaultBalance: bigint | undefined;
  dailyClaimLimit: bigint | undefined;
};

function ContractOverview({
  chainName,
  currentTokenDecimals,
  currentTokenSymbol,
  currentBalance,
  claimRewardAmount,
  minVaultBalance,
  dailyClaimLimit,
}: ContractOverviewProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 font-semibold text-lg">
        {chainName} Contract Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Vault Balance</div>
          <div className="font-bold text-lg">
            {currentBalance
              ? `${Number(
                  formatUnits(currentBalance, currentTokenDecimals)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })} ${currentTokenSymbol}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Min Reserve</div>
          <div className="font-bold text-lg">
            {minVaultBalance
              ? `${Number(
                  formatUnits(minVaultBalance, currentTokenDecimals)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })} ${currentTokenSymbol}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Daily Reward</div>
          <div className="font-bold text-lg">
            {claimRewardAmount
              ? `${Number(
                  formatUnits(claimRewardAmount, currentTokenDecimals)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                })} ${currentTokenSymbol}`
              : "—"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">Daily Claim Limit</div>
          <div className="font-bold text-lg">
            {dailyClaimLimit ? Number(dailyClaimLimit) : 250}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const {
    selectedChainId,
    getChainName,
    currentTokenAddress,
    currentContractAddress,
    currentTokenSymbol,
    currentTokenDecimals,
  } = useDailyRewardsV2Config();

  const {
    vaultStatus,
    claimRewardAmount,
    minVaultBalance,
    dailyClaimLimit,
    dailyGMContract,
    backendSigner,
    rewardToken,
    isLoading,
    refetch,
  } = useDailyRewardsV2Read(selectedChainId);

  // Fetch dynamic token metadata from the reward token contract
  const { decimals: dynamicTokenDecimals, symbol: dynamicTokenSymbol } =
    useErc20Metadata(
      (rewardToken || currentTokenAddress) as Address | undefined,
      selectedChainId
    );

  // Use dynamic metadata if available, fall back to configured values
  const tokenDecimals = dynamicTokenDecimals ?? currentTokenDecimals;
  const tokenSymbol = dynamicTokenSymbol ?? currentTokenSymbol;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading contract data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isAddress(currentContractAddress) &&
      isAddress(rewardToken || currentTokenAddress) ? (
        <>
          <ContractOverview
            chainName={getChainName()}
            claimRewardAmount={claimRewardAmount}
            currentBalance={vaultStatus?.currentBalance}
            currentTokenDecimals={tokenDecimals}
            currentTokenSymbol={tokenSymbol}
            dailyClaimLimit={dailyClaimLimit}
            minVaultBalance={minVaultBalance}
          />

          <VaultStatusCard
            chainId={selectedChainId}
            contractAddress={currentContractAddress}
            onRefetchAction={refetch}
            tokenAddress={(rewardToken || currentTokenAddress) as Address}
            tokenDecimals={tokenDecimals}
            tokenSymbol={tokenSymbol}
            vaultStatus={vaultStatus}
          />

          <ContractSettingsCard
            backendSigner={backendSigner}
            chainId={selectedChainId}
            claimRewardAmount={claimRewardAmount}
            dailyClaimLimit={dailyClaimLimit}
            dailyGMContract={dailyGMContract}
            minVaultBalance={minVaultBalance}
            onRefetchAction={refetch}
            rewardToken={rewardToken}
            tokenDecimals={tokenDecimals}
            tokenSymbol={tokenSymbol}
          />
        </>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/50 py-12">
          <div className="text-center text-muted-foreground">
            No contract address found for {getChainName()}
          </div>
        </div>
      )}
    </div>
  );
}
