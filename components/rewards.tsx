"use client";

import { memo } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletCard } from "@/components/connect-wallet-card";
import { DegenRewardCard } from "@/components/degen-reward-card";
import { HowItWorksCard } from "@/components/how-it-works-card";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { VaultBalanceCard } from "@/components/vault-balance-card";
import { VerifyingIdentityCard } from "@/components/verifying-identity-card";

export const Rewards = memo(function GMBase({
  sponsored,
}: {
  sponsored?: boolean;
}) {
  const { isConnected } = useAccount();
  const miniAppContextData = useMiniAppContext();

  const fid = miniAppContextData?.context?.user?.fid
    ? BigInt(miniAppContextData.context.user.fid)
    : undefined;

  return (
    <div className="mt-4 mb-12 space-y-4">
      <VaultBalanceCard />

      {isConnected ? (
        fid ? (
          <DegenRewardCard fid={fid} sponsored={Boolean(sponsored)} />
        ) : (
          <VerifyingIdentityCard />
        )
      ) : (
        <ConnectWalletCard />
      )}
      <HowItWorksCard />
    </div>
  );
});
