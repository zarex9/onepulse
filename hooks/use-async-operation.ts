"use client";

import { useCallback, useState } from "react";
import {
  type ERROR_MESSAGES,
  handleError,
  handleSuccess,
  type LOADING_MESSAGES,
  type SUCCESS_MESSAGES,
  showLoading,
} from "@/lib/error-handling";

type MessageKeys<T> = T extends Record<string, infer V> ? V : never;

type UseAsyncOperationOptions = {
  loadingMessage?: MessageKeys<typeof LOADING_MESSAGES> | string;
  successMessage?: MessageKeys<typeof SUCCESS_MESSAGES> | string;
  errorMessage: MessageKeys<typeof ERROR_MESSAGES> | string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  context?: Record<string, unknown>;
};

type UseAsyncOperationReturn<T> = {
  execute: () => Promise<T | undefined>;
  isLoading: boolean;
  error: unknown | null;
  reset: () => void;
};

/**
 * Custom hook for handling async operations with loading states and user feedback.
 * Provides loading state management, error handling, and toast notifications.
 *
 * @example
 * const { execute, isLoading } = useAsyncOperation(
 *   () => disconnectWallet(),
 *   {
 *     loadingMessage: LOADING_MESSAGES.WALLET_DISCONNECTING,
 *     successMessage: SUCCESS_MESSAGES.WALLET_DISCONNECTED,
 *     errorMessage: ERROR_MESSAGES.WALLET_DISCONNECT,
 *   }
 * );
 */
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions
): UseAsyncOperationReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let dismissLoading: (() => void) | undefined;

    try {
      if (options.loadingMessage) {
        dismissLoading = showLoading(options.loadingMessage);
      }

      const result = await operation();

      if (dismissLoading) {
        dismissLoading();
      }

      if (options.successMessage) {
        handleSuccess(options.successMessage);
      }

      options.onSuccess?.();
      return result;
    } catch (err) {
      if (dismissLoading) {
        dismissLoading();
      }

      setError(err);
      handleError(err, options.errorMessage, {
        operation: "async-operation",
        ...options.context,
      });

      options.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [operation, options]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, isLoading, error, reset };
}
