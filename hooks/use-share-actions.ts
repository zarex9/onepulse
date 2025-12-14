import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handling";

export function useShareActions() {
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
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Copied to clipboard");
    }
  };

  const shareToClipboard = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText}\n${shareUrl}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard");
  };

  return {
    shareToCast,
    shareToClipboard,
  };
}
