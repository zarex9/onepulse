"use client";

import React from "react";
import { useAccount } from "wagmi";
import { ConnectWalletCard } from "@/components/connect-wallet-card";
import { DegenRewardCard } from "@/components/degen-reward-card";
import { HowItWorksCard } from "@/components/how-it-works-card";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { SparklesText } from "@/components/ui/sparkles-text";
import { VerifyingIdentityCard } from "@/components/verifying-identity-card";

export const RewardsBase = React.memo(function GMBase({
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
    <div className="mt-8 space-y-6">
      {/* Header Section */}
      <div className="space-y-2 text-center">
        <SparklesText
          className="font-light text-3xl tracking-tight"
          sparklesCount={15}
        >
          Daily DEGEN Rewards
        </SparklesText>
        <p className="text-muted-foreground text-sm">
          Earn 5 DEGEN tokens every day on Base
        </p>
      </div>

      {isConnected ? (
        fid ? (
          <>
            <DegenRewardCard fid={fid} sponsored={Boolean(sponsored)} />

            <HowItWorksCard />
          </>
        ) : (
          <VerifyingIdentityCard />
        )
      ) : (
        <ConnectWalletCard />
      )}
    </div>
  );
});
