"use client";

import { ProcessingMirror } from "@/components/gm-chain-card/processing-mirror";
import { SuccessReporter } from "@/components/gm-chain-card/success-reporter";
import { Button } from "@/components/ui/button";
import {
  Transaction,
  TransactionButton,
} from "@/components/ui/custom-transaction";
import { Spinner } from "@/components/ui/spinner";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { useGMTransactionLogic } from "./use-gm-transaction-logic";

type GMTransactionProps = {
  isSponsored: boolean;
  isContractReady: boolean;
  processing: boolean;
  chainBtnClasses: string;
  buttonLabel: string;
  address: `0x${string}`;
  setProcessingAction: (value: boolean) => void;
};

export function GMTransaction({
  isSponsored,
  isContractReady,
  processing,
  chainBtnClasses,
  buttonLabel,
  address,
  setProcessingAction,
}: GMTransactionProps) {
  const { calls, hasCalls } = useGMTransactionLogic();

  if (!hasCalls) {
    return null;
  }

  return (
    <Transaction
      calls={calls}
      chainId={BASE_CHAIN_ID}
      isSponsored={isSponsored}
    >
      <TransactionButton
        disabled={!isContractReady || processing}
        renderAction={({ onSubmit, isDisabled, status, context }) => (
          <>
            <ProcessingMirror onChange={setProcessingAction} status={status} />
            <Button
              aria-busy={status === "pending"}
              className={`w-full ${chainBtnClasses}`}
              disabled={isDisabled}
              onClick={onSubmit}
              size="lg"
            >
              {status === "pending" ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                buttonLabel
              )}
            </Button>
            <SuccessReporter
              address={address}
              status={status}
              txHash={context?.transactionHash}
            />
          </>
        )}
      />
    </Transaction>
  );
}
