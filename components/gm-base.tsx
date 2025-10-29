"use client"

import React, { useMemo } from "react"
import { useAppKitAccount } from "@reown/appkit/react"

import { DAILY_GM_ADDRESSES } from "@/lib/constants"
import { GMChainCard } from "@/components/gm/GMChainCard"

export const GMBase = React.memo(function GMBase() {
  const { isConnected, address } = useAppKitAccount()
  // Use stable, theme-agnostic icons at SSR to avoid hydration mismatch.
  const celoIcon = "/celomark.png"
  const opIcon = "/opmark.png"

  // Define supported chains here; adding a new chain is a one-liner.
  const chains = useMemo(
    () => [
      { id: 8453, name: "Base", iconSrc: "/basemark.png" },
      { id: 42220, name: "Celo", iconSrc: celoIcon },
      { id: 10, name: "Optimism", iconSrc: opIcon },
    ],
    []
  )

  return (
    <div className="mt-4 space-y-4">
      {chains.map((c) => {
        const contractAddress = DAILY_GM_ADDRESSES[c.id]
        if (!contractAddress) return null
        return (
          <GMChainCard
            key={c.id}
            chainId={c.id}
            name={c.name}
            iconSrc={c.iconSrc}
            contractAddress={contractAddress}
            isConnected={Boolean(isConnected)}
            address={address}
          />
        )
      })}
    </div>
  )
})
