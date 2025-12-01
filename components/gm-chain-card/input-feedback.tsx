"use client";

import { memo } from "react";

type InputFeedbackProps = {
  sanitizedRecipient: string;
  isRecipientValid: boolean;
  isResolving: boolean;
  resolvedAddress: string | null;
  recipient: string;
};

const shouldShowResolvingMessage = (isResolving: boolean): boolean =>
  isResolving;

const shouldShowErrorMessage = (
  sanitizedRecipient: string,
  isRecipientValid: boolean,
  isResolving: boolean
): boolean =>
  sanitizedRecipient.length > 0 && !isRecipientValid && !isResolving;

export const InputFeedback = memo(
  ({
    sanitizedRecipient,
    isRecipientValid,
    isResolving,
    recipient,
  }: InputFeedbackProps) => {
    if (shouldShowResolvingMessage(isResolving)) {
      return (
        <p className="mt-2 text-blue-500 text-sm">Resolving {recipient}...</p>
      );
    }

    if (
      shouldShowErrorMessage(sanitizedRecipient, isRecipientValid, isResolving)
    ) {
      return (
        <p
          className="mt-2 text-red-500 text-sm"
          id="recipient-error"
          role="alert"
        >
          Enter a valid address or ENS/Basename.
        </p>
      );
    }

    return null;
  }
);
