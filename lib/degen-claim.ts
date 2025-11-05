import { waitForTransactionReceipt, writeContract } from "wagmi/actions"

import { dailyRewardsAbi } from "@/lib/abi/daily-rewards"
import { config as wagmiConfig } from "@/components/providers/wagmi-provider"

export async function executeClaimTransaction(
  address: `0x${string}`,
  contractAddress: `0x${string}`,
  fid: bigint,
  signature: `0x${string}`,
  deadline: bigint
) {
  return writeContract(wagmiConfig, {
    address: contractAddress,
    abi: dailyRewardsAbi,
    functionName: "claim",
    args: [fid, deadline, signature],
    account: address,
    chain: undefined,
  })
}

export async function reportClaimToBackend(
  address: `0x${string}`,
  fid: bigint,
  txHash: `0x${string}`
) {
  try {
    await fetch("/api/claims/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        fid: Number(fid),
        txHash,
      }),
    })
  } catch (err) {
    console.error("Failed to report claim:", err)
  }
}

export async function performClaimFlow(
  address: `0x${string}`,
  fid: bigint,
  contractAddress: `0x${string}`,
  generateSignature: (
    fid: bigint
  ) => Promise<{ signature: `0x${string}`; deadline: bigint }>,
  refetchEligibility: () => void,
  queryClient: ReturnType<typeof import("@tanstack/react-query").useQueryClient>
) {
  const { signature, deadline } = await generateSignature(fid)

  const hash = await executeClaimTransaction(
    address,
    contractAddress,
    fid,
    signature,
    deadline
  )

  await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 })

  // Report claim to backend; don't block on it for failure — log errors inside
  await reportClaimToBackend(address, fid, hash as `0x${string}`)

  // Refresh on-chain eligibility and invalidate readContract caches
  refetchEligibility()
  queryClient.invalidateQueries({ queryKey: ["useReadContract"] })

  return hash
}
