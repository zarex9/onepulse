import React from "react"

import { DAILY_GM_ADDRESSES } from "@/lib/constants"
import { GMModal } from "@/components/gm-chain-card/gm-modal"

interface ModalRendererProps {
  activeModalChainId: number | null
  chains: Array<{ id: number; name: string }>
  sponsored: boolean
  address?: string
  processing: boolean
  setProcessing: (value: boolean) => void
  refetchLastGmDay?: () => Promise<unknown>
  onClose: () => void
}

// Helper to get chain button classes
const getChainBtnClassesForId = (chainId: number): string => {
  if (chainId === 42220)
    return "bg-[#FCFF52] text-black hover:bg-[#FCFF52]/90 dark:bg-[#476520] dark:text-white dark:hover:bg-[#476520]/90"
  if (chainId === 10) return "bg-[#ff0420] text-white hover:bg-[#ff0420]/90"
  return "bg-[#0052ff] text-white hover:bg-[#0052ff]/90"
}

export const ModalRenderer = React.memo(function ModalRenderer({
  activeModalChainId,
  chains,
  sponsored,
  address,
  processing,
  setProcessing,
  refetchLastGmDay,
  onClose,
}: ModalRendererProps) {
  if (!activeModalChainId) return null

  const activeChain = chains.find((c) => c.id === activeModalChainId)
  if (!activeChain) return null

  const activeContractAddress = DAILY_GM_ADDRESSES[activeChain.id]
  if (!activeContractAddress) return null

  return (
    <GMModal
      isOpen={true}
      chainId={activeModalChainId}
      contractAddress={activeContractAddress}
      isSponsored={sponsored && activeModalChainId === 8453}
      isContractReady={Boolean(activeContractAddress)}
      processing={processing}
      chainBtnClasses={getChainBtnClassesForId(activeModalChainId)}
      address={address}
      refetchLastGmDay={refetchLastGmDay}
      onClose={onClose}
      setProcessing={setProcessing}
    />
  )
})
