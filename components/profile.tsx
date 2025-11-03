"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useAccount, useChainId } from "wagmi"

import { useGmStats } from "@/hooks/use-gm-stats"
import { useProfileChains } from "@/hooks/use-profile-chains"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileChainSelector } from "@/components/profile/profile-chain-selector"
import { ProfileIdentity } from "@/components/profile/profile-identity"
import { DisconnectWallet } from "@/components/wallet"

export type MiniAppUser = {
  fid: number
  displayName: string
  username: string
  pfpUrl?: string
}

export const Profile = React.memo(function Profile({
  user,
  isSmartWallet,
  onDisconnected,
  allowedChainIds,
}: {
  user?: MiniAppUser
  isSmartWallet?: boolean
  onDisconnected?: () => void
  allowedChainIds?: number[]
}) {
  const { address } = useAccount()
  const defaultStats = useMemo(
    () => ({
      currentStreak: 0,
      highestStreak: 0,
      allTimeGmCount: 0,
      lastGmDay: 0,
    }),
    []
  )

  const chains = useProfileChains(allowedChainIds, isSmartWallet)

  const connectedChainId = useChainId()
  // Default to the connected chain if it's supported; otherwise fallback to Base (8453)
  const initialSelected = useMemo(() => {
    return chains.some((c) => c.id === connectedChainId)
      ? connectedChainId
      : 8453
  }, [chains, connectedChainId])
  const [selectedChainId, setSelectedChainId] =
    useState<number>(initialSelected)
  // Ensure selected chain remains valid if list changes
  useEffect(() => {
    if (!chains.find((c) => c.id === selectedChainId)) {
      const id = setTimeout(() => setSelectedChainId(8453), 0)
      return () => clearTimeout(id)
    }
  }, [chains, selectedChainId])

  const { stats: selectedStats, isReady } = useGmStats(address, selectedChainId)

  // Note: We rely on the query key (which includes the address) to fetch on wallet change.
  // GM success flow already invalidates this key to refresh immediately after reporting.

  return (
    <div className="mt-4 space-y-4">
      {user && <ProfileIdentity user={user} />}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>GM Streak</CardTitle>
            <CardDescription>View GM stats by chain</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="sr-only">Chain</span>
            <ProfileChainSelector
              chains={chains}
              selectedChainId={selectedChainId}
              onChange={setSelectedChainId}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ProfileStats
            stats={selectedStats}
            defaultStats={defaultStats}
            isReady={isReady}
            address={address}
          />
        </CardContent>
      </Card>
      <DisconnectWallet onDisconnected={onDisconnected} />
    </div>
  )
})
