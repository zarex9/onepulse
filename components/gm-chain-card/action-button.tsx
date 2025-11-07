"use client"

import React from "react"
import { useSwitchChain } from "wagmi"
import { base, celo, optimism } from "wagmi/chains"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConnectWallet } from "@/components/wallet"

interface ActionButtonProps {
  isConnected: boolean
  chainId: number
  name: string
  onCorrectChain: boolean
  hasGmToday: boolean
  gmDisabled: boolean
  targetSec: number
  chainBtnClasses: string
  onOpenModal: () => void
  renderCountdown: (targetSec: number) => React.ReactNode
}

export const ActionButton = React.memo(function ActionButton({
  isConnected,
  chainId,
  name,
  onCorrectChain,
  hasGmToday,
  gmDisabled,
  targetSec,
  chainBtnClasses,
  onOpenModal,
  renderCountdown,
}: ActionButtonProps) {
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  // User not connected
  if (!isConnected) {
    return <ConnectWallet size="lg" className={`w-full ${chainBtnClasses} min-w-md`} />
  }

  // User on wrong chain
  if (!onCorrectChain) {
    if (hasGmToday) {
      return (
        <Button size="lg" className={`w-full ${chainBtnClasses}`} disabled>
          {renderCountdown(targetSec)}
        </Button>
      )
    }

    return (
      <Button
        size="lg"
        className={`w-full ${chainBtnClasses}`}
        onClick={() => {
          try {
            switchChain({
              chainId: chainId as
                | typeof base.id
                | typeof celo.id
                | typeof optimism.id,
            })
          } catch (e) {
            console.error("Failed to switch chain", e)
          }
        }}
        disabled={isSwitching}
        aria-busy={isSwitching}
      >
        {isSwitching ? (
          <>
            <Spinner /> Switching…
          </>
        ) : (
          `Switch to ${name}`
        )}
      </Button>
    )
  }

  // User on correct chain - show main action
  return (
    <Button
      size="lg"
      className={`w-full ${chainBtnClasses}`}
      disabled={gmDisabled}
      onClick={() => {
        if (!gmDisabled) onOpenModal()
      }}
    >
      {hasGmToday ? renderCountdown(targetSec) : "GM on " + name}
    </Button>
  )
})
