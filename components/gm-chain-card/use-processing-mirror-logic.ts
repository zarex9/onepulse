import { useEffect } from "react";
import type { TransactionStatus } from "@/types/transaction";

type UseProcessingMirrorLogicProps = {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
};

export function useProcessingMirrorLogic({
  status,
  onChange,
}: UseProcessingMirrorLogicProps): void {
  useEffect(() => {
    onChange(status === "pending");
  }, [status, onChange]);
}
