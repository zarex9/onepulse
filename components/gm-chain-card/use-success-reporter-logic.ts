import { useEffect, useRef } from "react";
import { useReducer } from "spacetimedb/react";
import { useReadDailyGmLastGmDay } from "@/helpers/contracts";
import { BASE_CHAIN_ID } from "@/lib/constants";
import { handleError } from "@/lib/error-handling";
import { reducers } from "@/spacetimedb";
import type { TransactionStatus } from "@/types/transaction";

type UseSuccessReporterLogicProps = {
  status: TransactionStatus;
  address: `0x${string}`;
  txHash?: string;
};

export function useSuccessReporterLogic({
  status,
  address,
  txHash,
}: UseSuccessReporterLogicProps): void {
  const didReport = useRef(false);

  const lastGmDay = useReadDailyGmLastGmDay({
    chainId: BASE_CHAIN_ID,
    args: [address],
  });

  const reportGm = useReducer(reducers.report);

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
          BASE_CHAIN_ID,
          txHash,
        },
        { silent: true }
      );
      return;
    }

    didReport.current = true;

    reportGm({ address, lastGmDay: lastGmDay.data });
  }, [status, address, lastGmDay.data, txHash, reportGm]);
}
