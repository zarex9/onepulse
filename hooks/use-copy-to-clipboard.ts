"use client";

import { useState } from "react";

type UseCopyToClipboardOptions = {
  timeout?: number;
  onCopyAction?: () => void;
};

type UseCopyToClipboardReturn = {
  isCopied: boolean;
  copyToClipboard: (value: string) => void;
};

export function useCopyToClipboard({
  timeout = 2000,
  onCopyAction,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);

  function copyToClipboard(value: string): void {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) {
      return;
    }

    navigator.clipboard.writeText(value).then(
      () => {
        setIsCopied(true);

        onCopyAction?.();

        if (timeout !== 0) {
          setTimeout(() => {
            setIsCopied(false);
          }, timeout);
        }
      },
      (_error) => {
        // Clipboard write failed - user can retry
        // Don't throw to prevent component crash
      }
    );
  }

  return { isCopied, copyToClipboard };
}
