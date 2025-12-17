import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { ClaimFallbackUI } from "./claim-fallback-ui";
import { useRewardClaimTransactionLogic } from "./use-reward-claim-transaction-logic";

type RewardClaimTransactionProps = {
  fid: bigint | undefined;
  sponsored: boolean;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

export function RewardClaimTransaction({
  fid,
  sponsored,
  onSuccess,
  onError,
  disabled = false,
}: RewardClaimTransactionProps) {
  const {
    numericChainId,
    getClaimContracts,
    onStatus,
    isDisabled,
    buttonState,
  } = useRewardClaimTransactionLogic({
    fid,
    sponsored,
    onSuccess,
    onError,
    disabled,
  });

  if (!numericChainId) {
    return <ClaimFallbackUI type="wallet" />;
  }

  return (
    <Transaction
      calls={getClaimContracts}
      chainId={numericChainId}
      isSponsored={sponsored}
      onStatus={onStatus}
    >
      <TransactionButton
        className="h-10 w-full rounded-md px-6 has-[>svg]:px-4"
        disabled={isDisabled}
        text={buttonState.label}
      />
    </Transaction>
  );
}
