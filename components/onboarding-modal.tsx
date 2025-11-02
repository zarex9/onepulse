"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  canSave?: boolean
  onSave?: () => void
}

export function OnboardingModal({
  open,
  onClose,
  canSave,
  onSave,
}: OnboardingModalProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to OnePulse</DialogTitle>
          <DialogDescription>
            Stay consistent across Base, Optimism, and Celo.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <ul className="list-disc pl-5 text-sm">
            <li>Save OnePulse for one-tap access</li>
            <li>Open OnePulse to GM each day</li>
            <li>Track streaks in Profile</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Got it
          </Button>
          {canSave && onSave && (
            <Button
              type="button"
              onClick={() => {
                onSave()
                onClose()
              }}
            >
              Save now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
