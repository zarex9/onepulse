"use client";

import { Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CongratsDialogProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onShareClickAction?: () => void;
  isStatsReady?: boolean;
};

/**
 * Congratulations dialog shown when all chains are completed
 * Displays celebration message with stats and share option
 */
export function CongratsDialog({
  open,
  onOpenChangeAction,
  onShareClickAction,
  isStatsReady,
}: CongratsDialogProps) {
  const handleShare = () => {
    onShareClickAction?.();
    onOpenChangeAction(false);
  };

  return (
    <Dialog onOpenChange={onOpenChangeAction} open={open && isStatsReady}>
      <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center sm:h-16 sm:w-16 sm:rounded-xl">
              <Trophy className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
            </div>
            <DialogTitle className="text-center">Perfect Streak!</DialogTitle>
            <DialogDescription className="text-center">
              You've completed GM on all chains today
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button className="w-full" onClick={handleShare}>
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

