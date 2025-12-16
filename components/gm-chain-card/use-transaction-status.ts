import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useCallback, useEffect, useRef } from "react";
import { useClaimStats } from "@/hooks/use-degen-claim";
import { ERROR_MESSAGES, handleError } from "@/lib/error-handling";

type UseTransactionStatusProps = {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  onRefreshError?: (error: Error) => void;
  refetchEligibility?: () => Promise<unknown>;
  claimer?: string;
};

type TransactionStatusHandlers = {
  onStatus: (status: LifecycleStatus) => void;
  handleRefreshAfterSuccess: (txHash: string) => Promise<void>;
};

const PENDING_STORAGE_KEY = "onepulse:pending-claim-confirms";

type PendingConfirm = {
  txHash: string;
  claimer: string;
};

/**
 * Hook to handle transaction lifecycle status updates.
 * Returns a synchronous onStatus callback for OnchainKit and a separate
 * async handler for refreshing eligibility after success.
 *
 * Only refreshes the eligibility query when transaction succeeds,
 * avoiding unnecessary invalidation of unrelated queries.
 */
export function useTransactionStatus({
  onSuccess,
  onError,
  onRefreshError,
  refetchEligibility,
  claimer,
}: UseTransactionStatusProps): TransactionStatusHandlers {
  const processedTxHashes = useRef<Set<string>>(new Set());
  const { mutate: mutateClaimStats } = useClaimStats();

  const getPendingConfirms = useCallback((): PendingConfirm[] => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(PENDING_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as PendingConfirm[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const persistPendingConfirms = useCallback((items: PendingConfirm[]) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addPendingConfirm = useCallback(
    (entry: PendingConfirm) => {
      const existing = getPendingConfirms();
      if (existing.some((item) => item.txHash === entry.txHash)) {
        return;
      }
      persistPendingConfirms([...existing, entry]);
    },
    [getPendingConfirms, persistPendingConfirms]
  );

  const removePendingConfirm = useCallback(
    (txHash: string) => {
      const existing = getPendingConfirms();
      const next = existing.filter((item) => item.txHash !== txHash);
      persistPendingConfirms(next);
    },
    [getPendingConfirms, persistPendingConfirms]
  );

  const shouldRetry = useCallback(
    (attempt: number, retries: number, status?: number) =>
      attempt < retries && status !== 400,
    []
  );

  const getBackoffDelay = useCallback(
    (attempt: number) => 2 ** attempt * 1000,
    []
  );

  const handleConfirmError = useCallback(
    (error: unknown, txHash: string, attempt: number, status?: number) => {
      handleError(
        error instanceof Error
          ? error
          : new Error(`Backend confirmation failed: ${status}`),
        ERROR_MESSAGES.CLAIM_FAILED,
        {
          operation: "claims/confirm",
          txHash,
          attempts: attempt + 1,
          ...(status && { status }),
        },
        { silent: true }
      );
    },
    []
  );

  const attemptConfirmation = useCallback(
    async (txHash: string, claimerAddress: string) => {
      const response = await fetch("/api/claims/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionHash: txHash,
          claimer: claimerAddress,
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorBody = await response.text();

      // If already processed, consider it a success
      if (errorBody.includes("already_processed")) {
        return { success: true };
      }

      return {
        success: false,
        status: response.status,
        errorBody,
      };
    },
    []
  );

  const retryWithBackoff = useCallback(
    async (attempt: number, retries: number) => {
      if (shouldRetry(attempt, retries)) {
        await new Promise((resolve) =>
          setTimeout(resolve, getBackoffDelay(attempt))
        );
        return true;
      }
      return false;
    },
    [shouldRetry, getBackoffDelay]
  );

  const handleConfirmationResult = useCallback(
    async (
      result: { success: boolean; status?: number; errorBody?: string },
      txHash: string,
      attempt: number,
      retries: number
    ) => {
      if (result.success) {
        return true;
      }

      const canRetry = await retryWithBackoff(attempt, retries);
      if (!canRetry) {
        handleConfirmError(
          new Error(result.errorBody),
          txHash,
          attempt,
          result.status
        );
      }
      return false;
    },
    [retryWithBackoff, handleConfirmError]
  );

  const confirmClaimOnBackend = useCallback(
    async (txHash: string, claimerOverride?: string, retries = 3) => {
      const targetClaimer = claimerOverride ?? claimer;
      if (!targetClaimer) {
        return;
      }

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await attemptConfirmation(txHash, targetClaimer);
          const success = await handleConfirmationResult(
            result,
            txHash,
            attempt,
            retries
          );
          if (success) {
            removePendingConfirm(txHash);
            return;
          }
        } catch (error) {
          const canRetry = await retryWithBackoff(attempt, retries);
          if (!canRetry) {
            handleConfirmError(error, txHash, attempt);
          }
        }
      }
    },
    [
      claimer,
      attemptConfirmation,
      handleConfirmationResult,
      retryWithBackoff,
      handleConfirmError,
      removePendingConfirm,
    ]
  );

  const processPendingConfirms = useCallback(async () => {
    const pending = getPendingConfirms();
    if (!pending.length) {
      return;
    }

    for (const entry of pending) {
      await confirmClaimOnBackend(entry.txHash, entry.claimer);
    }

    await mutateClaimStats();
    if (refetchEligibility) {
      await refetchEligibility();
    }
  }, [
    confirmClaimOnBackend,
    getPendingConfirms,
    mutateClaimStats,
    refetchEligibility,
  ]);

  useEffect(() => {
    processPendingConfirms().catch((error) => {
      handleError(
        error,
        ERROR_MESSAGES.CLAIM_FAILED,
        {
          operation: "claims/confirm/pending-drain",
        },
        {
          silent: true,
        }
      );
    });
  }, [processPendingConfirms]);

  const handleRefreshAfterSuccess = useCallback(
    async (txHash: string) => {
      try {
        // Confirm claim was successful on-chain and increment counter
        await confirmClaimOnBackend(txHash);

        // Directly mutate claim stats to update the UI counter
        await mutateClaimStats();

        // Only refetch eligibility - no need to invalidate broad query keys
        if (refetchEligibility) {
          await refetchEligibility();
        }
      } catch (error) {
        if (onRefreshError) {
          onRefreshError(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      } finally {
        if (onSuccess) {
          onSuccess(txHash);
        }
      }
    },
    [
      refetchEligibility,
      onSuccess,
      onRefreshError,
      confirmClaimOnBackend,
      mutateClaimStats,
    ]
  );

  const onStatus = useCallback(
    (status: LifecycleStatus) => {
      const isSuccess = status.statusName === "success";
      const isError = status.statusName === "error";

      if (isSuccess) {
        const txHash =
          status.statusData.transactionReceipts?.[0]?.transactionHash;
        if (txHash && !processedTxHashes.current.has(txHash)) {
          processedTxHashes.current.add(txHash);
          if (claimer) {
            addPendingConfirm({ txHash, claimer });
          }
          // Fire and forget - handleRefreshAfterSuccess runs async without blocking
          handleRefreshAfterSuccess(txHash);
        }
      }

      if (isError && onError) {
        const error = new Error(
          status.statusData.message || ERROR_MESSAGES.CLAIM_FAILED
        );
        handleError(error, ERROR_MESSAGES.CLAIM_FAILED, {
          operation: "degen-claim",
          statusData: status.statusData,
        });
        onError(error);
      }
    },
    [handleRefreshAfterSuccess, onError, addPendingConfirm, claimer]
  );

  return { onStatus, handleRefreshAfterSuccess };
}
