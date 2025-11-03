import { useMemo } from "react"

export type ProfileChain = { id: number; name: string }

export function useProfileChains(
  allowedChainIds?: number[],
  isSmartWallet?: boolean
): ProfileChain[] {
  return useMemo(() => {
    let list: ProfileChain[] = [
      { id: 8453, name: "Base" },
      { id: 42220, name: "Celo" },
      { id: 10, name: "Optimism" },
    ]
    if (Array.isArray(allowedChainIds) && allowedChainIds.length > 0) {
      list = list.filter((c) => allowedChainIds.includes(c.id))
    } else if (isSmartWallet) {
      list = list.filter((c) => c.id !== 42220)
    }
    return list
  }, [allowedChainIds, isSmartWallet])
}
