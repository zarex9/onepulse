"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { memo, type ReactNode, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import {
  ERROR_MESSAGES,
  handleError,
  handleSuccess,
  SUCCESS_MESSAGES,
} from "@/lib/error-handling";
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

    const handleSwitchChain = useCallback(async () => {
      const targetNetwork = networks.find((net) => net.id === chainId);
      if (!targetNetwork) {
        handleError(
          new Error(`Network ${chainId} not found`),
          ERROR_MESSAGES.NETWORK_UNSUPPORTED,
          { operation: "network-switch", chainId }
        );
        return;
      }

      setIsSwitching(true);
      try {
        await switchNetwork(targetNetwork);
        handleSuccess(SUCCESS_MESSAGES.NETWORK_SWITCHED);
      } catch (error) {
        handleError(error, ERROR_MESSAGES.NETWORK_SWITCH, {
          operation: "network-switch",
          chainId,
          networkName: targetNetwork.name,
        });
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
