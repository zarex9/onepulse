"use client";

import { useComposeCast, useOpenUrl } from "@coinbase/onchainkit/minikit";
import type { UseMutateFunction } from "@tanstack/react-query";
import { Copy, MessageCircle } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  type UserContext,
  useMiniAppContext,
} from "@/components/providers/miniapp-provider";
import { Button } from "@/components/ui/button";
import { type GmStats, useGmStats } from "@/hooks/use-gm-stats";
import { generateGMStatusMetadata } from "@/lib/og-utils";

type ComposeCastParams<TClose extends boolean | undefined = undefined> = {
  text?: string;
  embeds?: [] | [string] | [string, string];
  parent?: {
    type: "cast";
    hash: string;
  };
  close?: TClose;
  channelKey?: string;
};

type ComposeCastInnerResult = {
  hash: string;
  text?: string;
  embeds?: [] | [string] | [string, string];
  parent?: {
    type: "cast";
    hash: string;
  };
  channelKey?: string;
};

type ComposeCast = UseMutateFunction<
  {
    cast: ComposeCastInnerResult | null;
  },
  Error,
  ComposeCastParams<undefined>,
  unknown
>;

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
};

const getUsername = (user: UserContext | null) =>
  user?.username || user?.displayName || "Anonymous";

const getGMStats = (gmStats: GmStats | undefined) => ({
  currentStreak: gmStats?.currentStreak || 0,
  totalGMs: gmStats?.allTimeGmCount || 0,
});

const hasGMedToday = (gmStats: GmStats | undefined) => {
  if (!gmStats?.lastGmDay) {
    return false;
  }
  const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return gmStats.lastGmDay === today;
};

const createShareText = (claimedToday: boolean, currentStreak: number) => {
  const baseText = claimedToday
    ? "Just claimed my daily DEGEN rewards!"
    : "Check out my GM status!";

  if (currentStreak > 0) {
    const streakType = claimedToday ? "GM streak" : "streak";
    return `${baseText} ${currentStreak}-day ${streakType} 🔥`;
  }
  return `${baseText} Starting my GM journey!`;
};

const createShareMetadata = (options: {
  username: string;
  currentStreak: number;
  totalGMs: number;
  todayGM: boolean;
  claimedToday: boolean;
}) =>
  generateGMStatusMetadata({
    username: options.username,
    streak: options.currentStreak,
    totalGMs: options.totalGMs,
    chains: ["Base"],
    todayGM: options.todayGM,
    claimedToday: options.claimedToday,
  });

function useGMSharing(claimedToday: boolean) {
  const miniAppContextData = useMiniAppContext();
  const { stats: gmStats } = useGmStats();
  const { composeCast } = useComposeCast();
  const openUrl = useOpenUrl();

  const username = getUsername(miniAppContextData?.context?.user ?? null);
  const { currentStreak, totalGMs } = getGMStats(gmStats);
  const todayGM = hasGMedToday(gmStats);

  const shareText = createShareText(claimedToday, currentStreak);
  const metadata = createShareMetadata({
    username,
    currentStreak,
    totalGMs,
    todayGM,
    claimedToday,
  });

  return {
    shareText,
    shareUrl: metadata.url,
    composeCast,
    openUrl,
  };
}

const shareToTwitter = (
  shareText: string,
  shareUrl: string,
  openUrl: (url: string) => void
) => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  openUrl(twitterUrl);
};

const shareToCast = async (
  composeCast: ComposeCast,
  shareText: string,
  shareUrl: string
) => {
  try {
    await composeCast({
      text: `${shareText}`,
      embeds: [shareUrl],
    });
  } catch (error) {
    console.error("Failed to compose cast:", error);
    // Fallback to clipboard
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
}: ShareGMStatusProps) {
  const { shareText, shareUrl, composeCast, openUrl } =
    useGMSharing(claimedToday);

  const handleShare = async (platform: "twitter" | "cast" | "copy") => {
    switch (platform) {
      case "twitter":
        shareToTwitter(shareText, shareUrl, openUrl);
        break;
      case "cast":
        await shareToCast(composeCast, shareText, shareUrl);
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
        onClick={() => handleShare("twitter")}
        size={size}
        variant={variant}
      >
        <Icons.twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
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
