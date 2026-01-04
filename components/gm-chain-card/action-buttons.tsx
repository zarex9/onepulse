import type { Address } from "viem/accounts";
import { Button } from "@/components/ui/button";
import type { ChainId } from "@/lib/constants";
import { GMTransaction } from "./gm-transaction";
import { useActionButtonsLogic } from "./use-action-buttons-logic";

type ActionButtonsProps = {
  isRecipientValid: boolean;
  isContractReady: boolean;
  processing: boolean;
  sanitizedRecipient: string;
  chainBtnClasses: string;
  chainId: ChainId;
  contractAddress: Address;
  isSponsored: boolean;
  resolvedAddress: string | null;
  recipient: string;
  address: `0x${string}`;
  refetchLastGmDay?: () => Promise<unknown>;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
  onBack: () => void;
};

export function ActionButtons({
  isRecipientValid,
  isContractReady,
  processing,
  sanitizedRecipient,
  chainBtnClasses,
  chainId,
  contractAddress,
  isSponsored,
  resolvedAddress,
  recipient,
  address,
  refetchLastGmDay,
  onClose,
  setProcessing,
  onBack,
}: ActionButtonsProps) {
  const { isPlaceholderButtonDisabled } = useActionButtonsLogic({
    sanitizedRecipient,
    isContractReady,
    processing,
  });

  return (
    <>
      {isRecipientValid ? (
        <GMTransaction
          address={address}
          buttonLabel="Send GM"
          chainBtnClasses={chainBtnClasses}
          chainId={chainId}
          contractAddress={contractAddress}
          isContractReady={isContractReady}
          isSponsored={isSponsored}
          onCloseAction={onClose}
          processing={processing}
          recipient={resolvedAddress || recipient}
          refetchLastGmDayAction={refetchLastGmDay}
          setProcessingAction={setProcessing}
          transactionType="gmTo"
        />
      ) : (
        <Button
          className={`w-full ${chainBtnClasses}`}
          disabled={isPlaceholderButtonDisabled}
        >
          Enter a valid address
        </Button>
      )}
      <Button
        aria-disabled={processing}
        className="w-full"
        disabled={processing}
        onClick={onBack}
        variant="outline"
      >
        Back
      </Button>
    </>
  );
}
