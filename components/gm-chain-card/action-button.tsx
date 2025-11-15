"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { memo, type ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import { networks } from "@/lib/wagmi";

type ActionButtonProps = {
  isConnected: boolean;
  chainId: number;
  name: string;
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  targetSec: number;
  chainBtnClasses: string;
  onOpenModal: () => void;
  renderCountdown: (targetSec: number) => ReactNode;
};

export const ActionButton = memo(
  ({
    isConnected,
    chainId,
    name,
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    targetSec,
    chainBtnClasses,
    onOpenModal,
    renderCountdown,
  }: ActionButtonProps) => {
    const [isSwitching, setIsSwitching] = useState(false);
    const { switchNetwork } = useAppKitNetwork();

    const handleSwitchChain = useCallback(() => {
      const targetNetwork = networks.find((net) => net.id === chainId);
      if (!targetNetwork) {
        toast.error("Unsupported network");
        return;
      }

      setIsSwitching(true);
      try {
        switchNetwork(targetNetwork);
      } catch {
        toast.error("Failed to switch network. Please try again.");
      } finally {
        setIsSwitching(false);
      }
    }, [switchNetwork, chainId]);

    const handleOpenModal = useCallback(() => {
      if (!gmDisabled) {
        onOpenModal();
      }
    }, [gmDisabled, onOpenModal]);

    if (!isConnected) {
      return (
        <ConnectWallet className={`w-full ${chainBtnClasses}`} size="lg" />
      );
    }

    if (!onCorrectChain) {
      if (hasGmToday) {
        return (
          <Button className={`w-full ${chainBtnClasses}`} disabled size="lg">
            {renderCountdown(targetSec)}
          </Button>
        );
      }

      return (
        <Button
          aria-busy={isSwitching}
          className={`w-full ${chainBtnClasses}`}
          disabled={isSwitching}
          onClick={handleSwitchChain}
          size="lg"
        >
          {isSwitching ? (
            <>
              <Spinner /> Switching…
            </>
          ) : (
            `Switch to ${name}`
          )}
        </Button>
      );
    }

    return (
      <Button
        className={`w-full ${chainBtnClasses}`}
        disabled={gmDisabled}
        onClick={handleOpenModal}
        size="lg"
      >
        {hasGmToday ? renderCountdown(targetSec) : `GM on ${name}`}
      </Button>
    );
  }
);
