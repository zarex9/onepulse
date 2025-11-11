"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { DisconnectWallet } from "@/components/wallet";

type FooterProps = {
  onTabChange?: (tab: string) => void;
};

export function Footer({ onTabChange }: FooterProps) {
  const [loading, setLoading] = useState(false);

  const handleOpen = useCallback(async () => {
    const url =
      "https://miniapp.productclank.com/frame/25a3822f-e828-4af5-868c-a2061bf66e20?referrer=52d833eb-c0b5-484f-baa9-49eb95317ecf";

    try {
      setLoading(true);
      await sdk.actions.openMiniApp({ url });
    } catch (err) {
      console.error("Failed to open app:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <footer className="inset-x-0 bottom-0">
      <div className="flex w-full gap-2">
        <Button
          aria-label="Believe in OnePulse - open ProductClank"
          className="mx-auto flex-1"
          disabled={loading}
          onClick={handleOpen}
          size="sm"
          variant="outline"
        >
          Believe in OnePulse
        </Button>

        <DisconnectWallet onDisconnected={() => onTabChange?.("home")} />
      </div>
    </footer>
  );
}

export default Footer;
