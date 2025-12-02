"use client";

import type { VariantProps } from "class-variance-authority";
import { Unplug } from "lucide-react";
import { memo } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConnectWalletLogic } from "./wallet/use-connect-wallet-logic";
import { useDisconnectWalletLogic } from "./wallet/use-disconnect-wallet-logic";

type ButtonSize = VariantProps<typeof buttonVariants>["size"];

const ConnectWallet = memo(
  ({ size = "lg", className }: { size?: ButtonSize; className?: string }) => {
    const { connectWallet } = useConnectWalletLogic();
    const buttonSize = size === "lg" ? "size-lg" : "size-sm";
    return (
      <div className="mx-auto w-full">
        <Button
          aria-label="Connect wallet"
          className={cn(className, buttonSize)}
          onClick={connectWallet}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }
);

const DisconnectWallet = memo(
  ({ onDisconnected }: { onDisconnected?: () => void }) => {
    const { shouldShowDisconnect, disconnectWallet, isLoading } =
      useDisconnectWalletLogic(onDisconnected);

    if (!shouldShowDisconnect) {
      return null;
    }

    return (
      <Button
        aria-label="Disconnect wallet"
        className="flex-1"
        disabled={isLoading}
        onClick={disconnectWallet}
        size="sm"
        variant="outline"
      >
        <Unplug className="mr-2 h-4 w-4" /> Disconnect Wallet
      </Button>
    );
  }
);

export { ConnectWallet, DisconnectWallet };
