"use client";

import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { Copy, MessageCircle } from "lucide-react";
import {
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { getShareText } from "@/components/share-narratives";
import { Button } from "@/components/ui/button";
import type { GmStats } from "@/hooks/use-gm-stats";
import { generateSharePageUrl } from "@/lib/og-utils";

type ShareGMStatusProps = {
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  claimedToday?: boolean;
  completedAllChains?: boolean;
  gmStats?: GmStats;
};

const getUsername = (user: UserContext | null) =>
  user?.username || user?.displayName || "User";

const createShareText = (
  claimedToday: boolean,
  completedAllChains: boolean
) => {
  const text = getShareText(claimedToday, completedAllChains);
  return `${text}`.trimEnd();
};

function useGMSharing(
  claimedToday: boolean,
  completedAllChains: boolean,
  gmStats?: GmStats
) {
  const miniAppContextData = useMiniAppContext();
  const openUrl = useOpenUrl();

  const user = miniAppContextData?.context?.user;
  const username = getUsername(user ?? null);
  const displayName = user?.displayName || username;
  const pfp = user?.pfpUrl || "";

  const shareText = createShareText(claimedToday, completedAllChains);
  const shareUrl = generateSharePageUrl({
    username,
    displayName,
    pfp,
    chains: gmStats?.chains || [],
  });

  return {
    shareText,
    shareUrl,
    openUrl,
  };
}

const shareToCast = async (shareText: string, shareUrl: string) => {
  try {
    await sdk.actions.composeCast({
      text: `${shareText}`,
      embeds: [shareUrl],
    });
  } catch {
    // Cast composition failure handled by copying to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
  }
};

const shareToClipboard = (shareText: string, shareUrl: string) => {
  const fullText = `${shareText}\n\n${shareUrl}`;
  navigator.clipboard.writeText(fullText);
};

export function ShareGMStatus({
  className,
  variant = "outline",
  size = "default",
  claimedToday = false,
  completedAllChains = false,
  gmStats,
}: ShareGMStatusProps) {
  const { shareText, shareUrl } = useGMSharing(
    claimedToday,
    completedAllChains,
    gmStats
  );

  const handleShare = async (platform: "cast" | "copy") => {
    switch (platform) {
      case "cast":
        await shareToCast(shareText, shareUrl);
        break;
      case "copy":
        shareToClipboard(shareText, shareUrl);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        className="flex-1"
        onClick={() => handleShare("cast")}
        size={size}
        variant={variant}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Cast
      </Button>
      <Button
        className="flex-1"
        onClick={() => handleShare("copy")}
        size={size}
        variant={variant}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
    </div>
  );
}
