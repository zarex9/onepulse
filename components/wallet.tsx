"use client";

import { ConnectWallet as ConnectWalletButton } from "@coinbase/onchainkit/wallet";
import { Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDisconnectWalletLogic } from "./wallet/use-disconnect-wallet-logic";

export function ConnectWallet({ className }: { className?: string }) {
  return (
    <div className="mx-auto w-full">
      <ConnectWalletButton
        className={cn(
          "size-lg w-full bg-[#0052ff] text-white hover:bg-[#0052ff]/90",
          className
        )}
        disconnectedLabel="Log In"
      />
    </div>
  );
}

export function DisconnectWallet() {
  const { shouldShowDisconnect, disconnect, isLoading } =
    useDisconnectWalletLogic();

  if (!shouldShowDisconnect) {
    return null;
  }

  return (
    <Button
      aria-label="Disconnect wallet"
      className="flex-1"
      disabled={isLoading}
      onClick={() => disconnect.mutate()}
      size="sm"
      variant="outline"
    >
      <Unplug className="mr-2 h-4 w-4" /> Disconnect Wallet
    </Button>
  );
}
