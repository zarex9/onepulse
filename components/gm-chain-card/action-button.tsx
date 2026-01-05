"use client";

import { useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import type { ChainId } from "@/lib/constants";
import { GMTransaction } from "./gm-transaction";

type ActionButtonProps = {
  isConnected: boolean;
  chainId: ChainId;
  name: string;
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  chainBtnClasses: string;
  isSponsored: boolean;
  processing: boolean;
  address?: `0x${string}`;
  setProcessingAction: (value: boolean) => void;
};

export function ActionButton({
  isConnected,
  chainId,
  name,
  onCorrectChain,
  hasGmToday,
  gmDisabled,
  chainBtnClasses,
  isSponsored,
  processing,
  address,
  setProcessingAction,
}: ActionButtonProps) {
  const switchChain = useSwitchChain();
  const isLoading = switchChain.isPending;

  if (!isConnected) {
    return <ConnectWallet className={`${chainBtnClasses}`} />;
  }

  if (hasGmToday) {
    return (
      <Button className={`w-full ${chainBtnClasses}`} disabled size="lg">
        Already GM'd
      </Button>
    );
  }

  if (!onCorrectChain) {
    return (
      <Button
        aria-busy={isLoading}
        className={`w-full ${chainBtnClasses}`}
        disabled={isLoading}
        onClick={() => switchChain.mutateAsync({ chainId })}
        size="lg"
      >
        {isLoading ? (
          <>
            <Spinner /> Switching…
          </>
        ) : (
          `Switch to ${name}`
        )}
      </Button>
    );
  }

  if (!address) {
    return null;
  }

  return (
    <GMTransaction
      address={address}
      buttonLabel={`GM on ${name}`}
      chainBtnClasses={chainBtnClasses}
      chainId={chainId}
      isContractReady={!gmDisabled}
      isSponsored={isSponsored}
      processing={processing}
      setProcessingAction={setProcessingAction}
    />
  );
}
