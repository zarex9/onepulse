import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useReadDailyGmLastGmDay } from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";
import { handleError } from "@/lib/error-handling";
import type { TransactionStatus } from "@/types/transaction";
import { performGmReporting } from "./gm-reporting-utils";

type UseSuccessReporterLogicProps = {
  status: TransactionStatus;
  onReported?: () => void;
  address: `0x${string}`;
  refetchLastGmDay?: () => Promise<unknown>;
  chainId: ChainId;
  txHash?: string;
};

export const useSuccessReporterLogic = ({
  status,
  onReported,
  address,
  refetchLastGmDay,
  chainId,
  txHash,
}: UseSuccessReporterLogicProps) => {
  const didReport = useRef(false);
  const queryClient = useQueryClient();
  const miniAppContextData = useMiniAppContext();
  const user = miniAppContextData?.context?.user;

  const lastGmDay = useReadDailyGmLastGmDay({ chainId, args: [address] });

  useEffect(() => {
    if (status !== "success" || !address || didReport.current) {
      return;
    }
    if (!lastGmDay.data) {
      handleError(
        new Error("Cannot report GM success without lastGmDay"),
        "GM reporting failed",
        {
          operation: "gm/reporting/missing-last-gm-day",
          address,
          chainId,
          txHash,
        },
        { silent: true }
      );
      return;
    }

    didReport.current = true;

    performGmReporting({
      address,
      chainId,
      txHash,
      user,
      queryClient,
      lastGmDay: lastGmDay.data,
      refetchLastGmDay,
      onReported,
    }).catch((error) => {
      handleError(
        error,
        "GM reporting failed",
        {
          operation: "gm/reporting",
          address,
          chainId,
          txHash,
        },
        { silent: true }
      );
      didReport.current = false; // Allow retry on next success
    });
  }, [
    status,
    address,
    lastGmDay.data,
    onReported,
    queryClient,
    refetchLastGmDay,
    chainId,
    txHash,
    user,
  ]);
};
