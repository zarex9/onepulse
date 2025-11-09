import { ConnectWallet as Connect } from "@coinbase/onchainkit/wallet";
import type { VariantProps } from "class-variance-authority";
import { Unplug } from "lucide-react";
import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonSize = VariantProps<typeof buttonVariants>["size"];
function ConnectWallet({
  size = "lg" as ButtonSize,
  className,
}: {
  size?: ButtonSize;
  className?: string;
}) {
  const buttonSize = size === "lg" ? "size-lg" : "size-sm";
  return (
    <div className="mx-auto w-full">
      <Connect
        aria-label="Connect wallet"
        className={cn(className, buttonSize)}
      >
        Connect Wallet
      </Connect>
    </div>
  );
}

const DisconnectWallet = React.memo(function DisconnectWallet({
  onDisconnected,
}: {
  onDisconnected?: () => void;
}) {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const miniAppContextData = useMiniAppContext();

  const handleDisconnect = React.useCallback(() => {
    disconnect();
    onDisconnected?.();
  }, [disconnect, onDisconnected]);

  const isInMiniApp = Boolean(miniAppContextData?.isInMiniApp);
  return (
    isConnected &&
    !isInMiniApp && (
      <div className="fixed inset-x-0 bottom-0 mx-auto w-[95%] max-w-lg p-4">
        <Button
          aria-label="Disconnect wallet"
          className="w-full"
          onClick={handleDisconnect}
          variant="outline"
        >
          <Unplug className="mr-2 h-4 w-4" /> Disconnect Wallet
        </Button>
      </div>
    )
  );
});

export { ConnectWallet, DisconnectWallet };
