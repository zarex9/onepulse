export type ButtonState = {
  label: string;
  disabled: boolean;
};

type GetButtonStateParams = {
  isConnected: boolean;
  isEligibilityPending: boolean;
  hasSentGMToday: boolean;
  canClaim: boolean;
  isDailyLimitReached: boolean;
  isVaultDepleted?: boolean;
  hasAlreadyClaimed?: boolean;
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
  isDailyLimitReached,
  isVaultDepleted = false,
  hasAlreadyClaimed = false,
}: GetButtonStateParams): ButtonState {
  if (!isConnected) {
    return {
      label: "Connect wallet",
      disabled: true,
    };
  }

  if (isEligibilityPending) {
    return {
      label: "Checking eligibility...",
      disabled: true,
    };
  }

  if (isVaultDepleted) {
    return {
      label: "Vault is depleted",
      disabled: true,
    };
  }

  if (!hasSentGMToday) {
    return {
      label: "Send GM first",
      disabled: true,
    };
  }

  if (hasAlreadyClaimed) {
    return {
      label: "Already claimed",
      disabled: true,
    };
  }

  if (isDailyLimitReached) {
    return {
      label: "Daily limit reached",
      disabled: true,
    };
  }

  if (!canClaim) {
    return {
      label: "Not eligible",
      disabled: true,
    };
  }

  return {
    label: "Claim rewards",
    disabled: false,
  };
}
