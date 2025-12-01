import { useCallback } from "react";
import type { GmStats } from "@/hooks/use-gm-stats";
import { shouldShowShareButton } from "@/lib/share";

type UseCongratsDialogLogicProps = {
  onOpenChange: (open: boolean) => void;
  onShare?: () => void;
  gmStats?: GmStats;
};

export function useCongratsDialogLogic({
  onOpenChange,
  onShare,
  gmStats,
}: UseCongratsDialogLogicProps) {
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleShare = useCallback(() => {
    handleClose();
    onShare?.();
  }, [handleClose, onShare]);

  const showShareButton = shouldShowShareButton(gmStats);

  return {
    handleClose,
    handleShare,
    showShareButton,
  };
}
