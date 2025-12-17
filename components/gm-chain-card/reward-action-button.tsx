"use client";

import { memo } from "react";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import type { ButtonState } from "./get-button-state";

type RewardActionButtonProps = {
  state: ButtonState;
};

export const RewardActionButton = memo(({ state }: RewardActionButtonProps) => {
  if (state.showFallback) {
    return <ClaimFallbackUI type={state.showFallback} />;
  }
  return null;
});
