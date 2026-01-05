import type { TransactionStatus } from "@/types/transaction";
import { useSuccessReporterLogic } from "./use-success-reporter-logic";

type SuccessReporterProps = {
  status: TransactionStatus;
  address: `0x${string}`;
  txHash?: string;
};

export function SuccessReporter({
  status,
  address,
  txHash,
}: SuccessReporterProps) {
  useSuccessReporterLogic({
    status,
    address,
    txHash,
  });

  return null;
}
