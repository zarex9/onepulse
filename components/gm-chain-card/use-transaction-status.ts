import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ERROR_MESSAGES, handleError } from "@/lib/error-handling";

type UseTransactionStatusProps = {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  refetchEligibility: () => Promise<unknown> | undefined;
};

type TransactionStatusHandlers = {
  onStatus: (status: LifecycleStatus) => void;
  handleRefreshAfterSuccess: (txHash: string) => Promise<void>;
};

/**
 * Hook to handle transaction lifecycle status updates.
 * Returns a synchronous onStatus callback for OnchainKit and a separate
 * async handler for refreshing eligibility after success.
 */
export function useTransactionStatus({
  onSuccess,
  onError,
  refetchEligibility,
}: UseTransactionStatusProps): TransactionStatusHandlers {
  const queryClient = useQueryClient();

  const handleRefreshAfterSuccess = useCallback(
    async (txHash: string) => {
      try {
        await Promise.all([
          Promise.resolve(refetchEligibility()),
          queryClient.invalidateQueries({ queryKey: ["useReadContract"] }),
        ]);
        if (onSuccess) {
          onSuccess(txHash);
        }
      } catch (error) {
        // Log but don't block success flow - transaction already succeeded
        console.error(
          "Failed to refresh eligibility after transaction:",
          error
        );
        if (onSuccess) {
          onSuccess(txHash);
        }
      }
    },
    [refetchEligibility, queryClient, onSuccess]
  );

  const onStatus = useCallback(
    (status: LifecycleStatus) => {
      const isSuccess = status.statusName === "success";
      const isError = status.statusName === "error";

      if (isSuccess) {
        const txHash =
          status.statusData.transactionReceipts[0]?.transactionHash;
        if (txHash) {
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
    [handleRefreshAfterSuccess, onError]
  );

  return { onStatus, handleRefreshAfterSuccess };
}
