"use client";

import { Copy } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { RewardClaimTransaction } from "@/components/gm-chain-card/reward-claim-transaction";
import { Icons } from "@/components/icons";
import { useRewardChainCardLogic } from "@/components/reward-chain-card/use-reward-chain-card-logic";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export type RewardChainCardProps = {
  chainId: number;
  name: string;
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
  sponsored: boolean;
  onClaimSuccess?: () => void;
};

export const RewardChainCard = memo((props: RewardChainCardProps) => {
  const {
    chainId,
    name,
    fid,
    isConnected,
    address,
    sponsored,
    onClaimSuccess,
  } = props;
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    onCopyAction: () => toast.success("Copied to clipboard"),
  });
  const {
    isCorrectChain,
    claimState,
    isCheckingEligibility,
    dailyClaimCount,
    chainBtnClasses,
    handleSwitchChain,
    isSwitching,
    buttonState,
    hasAlreadyClaimed,
    chainIconName,
    tokenSymbol,
    tokenAddress,
    displayRewardAmount,
    claimLimitDisplay,
  } = useRewardChainCardLogic({
    chainId,
    fid,
    isConnected,
    address,
  });

  const isEligible = claimState?.isEligible ?? false;
  const BASE_CHAIN_ID = 8453;

  return (
    <Item variant="outline">
      <ItemContent className="items-start">
        <ItemMedia>
          {Icons[chainIconName as keyof typeof Icons]?.({
            className: "h-8 w-24 text-current",
            role: "img",
            "aria-label": `${name} wordmark`,
            focusable: false,
          })}
        </ItemMedia>
      </ItemContent>
      <ItemActions>
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg tracking-tight">
            {displayRewardAmount} {tokenSymbol}
          </span>
          {tokenAddress && (
            <Button
              aria-label="Copy CA"
              className="h-5 w-5 p-0 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => copyToClipboard(tokenAddress)}
              variant="ghost"
            >
              <Copy className={`h-3 w-3 ${isCopied ? "text-green-600" : ""}`} />
            </Button>
          )}
        </div>
      </ItemActions>
      <ItemFooter className="flex-col gap-3">
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Daily Claims</span>
            <span className="font-medium">
              {dailyClaimCount} / {claimLimitDisplay}
            </span>
          </div>
          <div className="overflow-hidden rounded-full bg-secondary">
            <div
              className="h-2 bg-primary transition-all"
              style={{
                width: `${Math.min(
                  (dailyClaimCount / claimLimitDisplay) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {!isCorrectChain && isConnected && !hasAlreadyClaimed && (
          <Button
            aria-busy={isSwitching}
            className={`w-full ${chainBtnClasses}`}
            disabled={isSwitching}
            onClick={handleSwitchChain}
            size="lg"
          >
            {isSwitching ? "Switching..." : `Switch to ${name}`}
          </Button>
        )}

        {!isCorrectChain && isConnected && hasAlreadyClaimed && (
          <Button
            className={`w-full ${chainBtnClasses}`}
            disabled={true}
            size="lg"
          >
            {buttonState?.label || "Already claimed"}
          </Button>
        )}

        {isCorrectChain && (
          <RewardClaimTransaction
            className={chainBtnClasses}
            disabled={!isEligible}
            fid={fid}
            onSuccess={onClaimSuccess}
            sponsored={sponsored && chainId === BASE_CHAIN_ID}
          />
        )}

        {isCheckingEligibility && (
          <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-xs">
            <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            Checking eligibility
          </div>
        )}
      </ItemFooter>
    </Item>
  );
});

RewardChainCard.displayName = "RewardChainCard";
