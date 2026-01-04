import type { ChainId } from "@/lib/constants";
import type { TransactionStatus } from "@/types/transaction";
import { useSuccessReporterLogic } from "./use-success-reporter-logic";

type SuccessReporterProps = {
  status: TransactionStatus;
  onReported?: () => void;
  address: `0x${string}`;
  refetchLastGmDay?: () => Promise<unknown>;
  chainId: ChainId;
  txHash?: string;
};

export function SuccessReporter({
  status,
  onReported,
  address,
  refetchLastGmDay,
  chainId,
  txHash,
}: SuccessReporterProps) {
  useSuccessReporterLogic({
    status,
    onReported,
    address,
    refetchLastGmDay,
    chainId,
    txHash,
  });

  return null;
}
