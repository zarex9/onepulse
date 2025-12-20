"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConnectWallet } from "@/components/wallet";
import { useActionButtonLogic } from "./use-action-button-logic";

type ActionButtonProps = {
  isConnected: boolean;
  chainId: number;
  name: string;
  onCorrectChain: boolean;
  hasGmToday: boolean;
  gmDisabled: boolean;
  chainBtnClasses: string;
  onOpenModal: () => void;
};

export const ActionButton = memo(
  ({
    isConnected,
    chainId,
    name,
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    onOpenModal,
  }: ActionButtonProps) => {
    const { doSwitch, isLoading, handleOpenModal } = useActionButtonLogic({
      chainId,
      gmDisabled,
      onOpenModal,
    });

    if (!isConnected) {
      return (
        <ConnectWallet className={`w-full ${chainBtnClasses}`} size="lg" />
      );
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
          onClick={doSwitch}
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

    return (
      <Button
        className={`w-full ${chainBtnClasses}`}
        disabled={gmDisabled}
        onClick={handleOpenModal}
        size="lg"
      >
        GM on {name}
      </Button>
    );
  }
);
ActionButton.displayName = "ActionButton";
