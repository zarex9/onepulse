import React, { useCallback } from "react"
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
} from "@coinbase/onchainkit/transaction"
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction"
import { useQueryClient } from "@tanstack/react-query"
import type { ContractFunctionParameters } from "viem"
import { useAccount, useChainId } from "wagmi"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { getDailyRewardsAddress } from "@/lib/constants"
import { useClaimEligibility } from "@/hooks/use-degen-claim"

import { TransactionToast } from "../transaction-toast"

interface DegenClaimTransactionProps {
  fid: bigint | undefined
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
}

/**
 * Component for claiming daily DEGEN rewards using OnchainKit Transaction with sponsorship.
 * Backend signs the claim authorization, user submits sponsored transaction.
 */
export const DegenClaimTransaction = React.memo(function DegenClaimTransaction({
  fid,
  onSuccess,
  onError,
  disabled = false,
}: DegenClaimTransactionProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const contractAddress = getDailyRewardsAddress(chainId)
  const {
    canClaim,
    hasSentGMToday,
    isPending: isEligibilityPending,
    refetch: refetchEligibility,
  } = useClaimEligibility({ fid })

  // Get backend-signed authorization for claim
  const getClaimContracts = useCallback(async (): Promise<
    ContractFunctionParameters[]
  > => {
    if (!address || !fid || !contractAddress) {
      throw new Error("Missing required parameters")
    }

    // Calculate fresh deadline (5 minutes from now)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300)

    // Request backend signature (backend reads current nonce from contract)
    const response = await fetch("/api/claims/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimer: address,
        fid: fid.toString(),
        deadline: deadline.toString(),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get claim authorization")
    }

    const { signature, nonce: backendNonce } = await response.json()

    // Return contract call with backend signature and nonce
    return [
      {
        address: contractAddress as `0x${string}`,
        abi: dailyRewardsAbi,
        functionName: "claim",
        args: [
          address,
          fid,
          BigInt(backendNonce),
          deadline,
          signature as `0x${string}`,
        ],
      },
    ]
  }, [address, fid, contractAddress])

  const handleStatus = useCallback(
    (status: LifecycleStatus) => {
      console.log("Transaction status:", status)

      if (status.statusName === "success") {
        // Refetch eligibility after successful claim
        refetchEligibility()
        queryClient.invalidateQueries({ queryKey: ["useReadContract"] })

        // Call success callback
        const txHash = status.statusData.transactionReceipts[0]?.transactionHash
        if (txHash && onSuccess) {
          onSuccess(txHash)
        }
      } else if (status.statusName === "error") {
        // Call error callback
        if (onError) {
          const error = new Error(
            status.statusData.message || "Transaction failed"
          )
          onError(error)
        }
      }
    },
    [refetchEligibility, queryClient, onSuccess, onError]
  )

  const isDisabled =
    disabled ||
    !address ||
    !fid ||
    !contractAddress ||
    !canClaim ||
    !hasSentGMToday ||
    isEligibilityPending

  if (!address) {
    return (
      <div className="border-border bg-muted text-muted-foreground w-full rounded-lg border p-4 text-center text-sm">
        Connect your wallet to claim rewards
      </div>
    )
  }

  if (!hasSentGMToday) {
    return (
      <div className="border-border bg-muted text-muted-foreground w-full rounded-lg border p-4 text-center text-sm">
        Send GM first to claim rewards
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <Transaction
        chainId={chainId}
        calls={getClaimContracts}
        onStatus={handleStatus}
        isSponsored={true}
      >
        <TransactionButton
          disabled={isDisabled}
          className="w-full"
          text="Claim Rewards"
        />
        <TransactionSponsor />
        <TransactionToast />
      </Transaction>
    </div>
  )
})
