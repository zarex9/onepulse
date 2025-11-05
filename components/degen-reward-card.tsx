"use client"

import React from "react"
import { useAccount } from "wagmi"

import {
  useClaimEligibility,
  useRewardVaultStatus,
} from "@/hooks/use-degen-claim"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DegenClaimTransaction } from "@/components/gm-chain-card/degen-claim-transaction"

interface DegenRewardCardProps {
  fid: bigint | undefined
}

interface ClaimState {
  isEligible: boolean
  hasAlreadyClaimed: boolean
  isFidBlacklisted: boolean
  reward: bigint
}

interface ClaimEligibility {
  ok: boolean
  fidIsBlacklisted: boolean
  fidClaimedToday: boolean
  claimerClaimedToday: boolean
  reward: bigint
  vaultBalance: bigint
  minReserve: bigint
}

function extractClaimState(
  claimStatus: ClaimEligibility | undefined
): ClaimState {
  return {
    isEligible: claimStatus?.ok ?? false,
    hasAlreadyClaimed: claimStatus?.claimerClaimedToday ?? false,
    isFidBlacklisted: claimStatus?.fidIsBlacklisted ?? false,
    reward: claimStatus?.reward ?? 0n,
  }
}

function getStatusConfig(state: ClaimState) {
  if (state.isFidBlacklisted) {
    return {
      icon: "🚫",
      title: "Access Restricted",
      description: "FID is blacklisted from claiming rewards",
      bgGradient: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      badge: { text: "Blocked", variant: "destructive" as const },
    }
  }
  if (state.hasAlreadyClaimed) {
    return {
      icon: "✅",
      title: "Claimed Today",
      description: "You've already claimed your daily rewards",
      bgGradient: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      badge: { text: "Claimed", variant: "secondary" as const },
    }
  }
  if (state.isEligible) {
    return {
      icon: "🎉",
      title: "Ready to Claim!",
      description: "Your daily DEGEN rewards are waiting",
      bgGradient: "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-amber-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      badge: { text: "Available", variant: "default" as const },
    }
  }
  return {
    icon: "⏳",
    title: "Not Eligible Yet",
    description: "Complete requirements to claim rewards",
    bgGradient: "bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950/20 dark:to-slate-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
    iconBg: "bg-gray-100 dark:bg-gray-900/30",
    badge: { text: "Pending", variant: "outline" as const },
  }
}

interface RewardCardProps {
  fid: bigint | undefined
  state: ClaimState
  isCheckingEligibility: boolean
}

function RewardCard({
  fid,
  state,
  isCheckingEligibility,
}: RewardCardProps) {
  const config = getStatusConfig(state)

  return (
    <Card className={`${config.bgGradient} ${config.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg} shadow-sm`}>
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                {config.title}
              </CardTitle>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                config.badge.variant === 'destructive' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : config.badge.variant === 'secondary'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : config.badge.variant === 'outline'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {config.badge.text}
              </span>
            </div>
          </div>
          {!isCheckingEligibility && state.reward > 0n && (
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(Number(state.reward) / 1e18).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground font-medium">DEGEN</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {config.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isCheckingEligibility ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Checking eligibility...
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Status updated
              </>
            )}
          </div>

          <DegenClaimTransaction fid={fid} disabled={!state.isEligible} />
        </div>
      </CardContent>
    </Card>
  )
}

function DisconnectedCard() {
  return (
    <Card className="bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 shadow-sm">
            <span className="text-2xl">🔗</span>
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Connect Wallet
            </CardTitle>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Required
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Connect your wallet to access daily DEGEN rewards and start earning.
        </p>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  )
}

function DepletedVaultCard() {
  return (
    <Card className="bg-linear-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 shadow-sm">
            <span className="text-2xl">⏸️</span>
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Vault Depleted
            </CardTitle>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Temporary
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The reward vault is currently empty. Check back soon for more rewards!
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          Refilling in progress
        </div>
      </CardContent>
    </Card>
  )
}

export const DegenRewardCard = React.memo(function DegenRewardCard({
  fid,
}: DegenRewardCardProps) {
  const { address, isConnected } = useAccount()
  const { claimStatus, isPending: isCheckingEligibility } = useClaimEligibility(
    {
      fid,
      enabled: isConnected,
    }
  )
  const { hasRewards } = useRewardVaultStatus()

  if (!isConnected || !address) {
    return <DisconnectedCard />
  }

  if (!hasRewards) {
    return <DepletedVaultCard />
  }

  const claimState = extractClaimState(claimStatus)
  return (
    <RewardCard
      fid={fid}
      state={claimState}
      isCheckingEligibility={isCheckingEligibility}
    />
  )
})
