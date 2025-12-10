export type ButtonState = {
  label: string;
  disabled: boolean;
  showFallback: "wallet" | "gm-first" | "low-score" | null;
};

type GetButtonStateParams = {
  isConnected: boolean;
  isEligibilityPending: boolean;
  hasSentGMToday: boolean;
  canClaim: boolean;
  scoreCheckPassed?: boolean;
  currentStreak?: number;
  streakCheckPassed?: boolean;
};

/**
 * Determines the button state based on eligibility and connection status.
 * Uses a flat decision tree to minimize cyclomatic complexity.
 */
export function getButtonState({
  isConnected,
  isEligibilityPending,
  hasSentGMToday,
  canClaim,
  scoreCheckPassed,
  currentStreak,
  streakCheckPassed,
}: GetButtonStateParams): ButtonState {
  if (!isConnected) {
    return {
      label: "Connect wallet",
      disabled: true,
      showFallback: "wallet",
    };
  }

  if (!hasSentGMToday) {
    return {
      label: "Send GM First",
      disabled: true,
      showFallback: "gm-first",
    };
  }

  if (isEligibilityPending) {
    return {
      label: "Checking eligibility...",
      disabled: true,
      showFallback: null,
    };
  }

  // Low score but has streak: show streak status
  if (scoreCheckPassed === false && streakCheckPassed === false) {
    return {
      label: `Build Streak (${currentStreak ?? 0}/3)`,
      disabled: true,
      showFallback: "low-score",
    };
  }

  // Low score but meets streak requirement: can claim
  if (scoreCheckPassed === false && streakCheckPassed === true) {
    return {
      label: "Claim Rewards",
      disabled: false,
      showFallback: null,
    };
  }

  if (!canClaim) {
    return {
      label: "Already Claimed",
      disabled: true,
      showFallback: null,
    };
  }

  return {
    label: "Claim Rewards",
    disabled: false,
    showFallback: null,
  };
}
