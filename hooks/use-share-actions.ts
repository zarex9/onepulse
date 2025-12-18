"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { handleError } from "@/lib/error-handling";

type ShareActions = {
  shareToCast: (shareText: string, shareUrl: string) => Promise<void>;
  shareToClipboard: (shareText: string, shareUrl: string) => void;
};

export function useShareActions(): ShareActions {
  const { copyToClipboard } = useCopyToClipboard({
    onCopyAction: () => toast.success("Copied to clipboard"),
  });

  const shareToCast = async (shareText: string, shareUrl: string) => {
    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      });
    } catch (error) {
      // Cast composition failure handled by copying to clipboard
      handleError(
        error,
        "Failed to compose cast",
        {
          operation: "share/compose-cast",
        },
        { silent: true }
      );
      try {
        copyToClipboard(`${shareText}\n${shareUrl}`);
      } catch (clipboardError) {
        handleError(
          clipboardError,
          "Failed to copy to clipboard",
          { operation: "share/copy-to-clipboard" },
          { silent: true }
        );
        toast.error("Copy failed");
      }
    }
  };

  const shareToClipboard = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText}\n${shareUrl}`;
    try {
      copyToClipboard(fullText);
    } catch (clipboardError) {
      handleError(
        clipboardError,
        "Failed to copy to clipboard",
        { operation: "share/copy-to-clipboard" },
        { silent: true }
      );
      toast.error("Copy failed");
    }
  };

  return {
    shareToCast,
    shareToClipboard,
  };
}
