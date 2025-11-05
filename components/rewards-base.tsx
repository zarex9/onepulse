"use client"

import React from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { useAccount } from "wagmi"

import { DegenRewardCard } from "@/components/degen-reward-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RewardsBase() {
  const { isConnected } = useAccount()
  const { context } = useMiniKit()

  // Get FID from context - Farcaster provides this
  const fid = context?.user?.fid ? BigInt(context.user.fid) : undefined

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
          🎉 Daily DEGEN Rewards
        </h1>
        <p className="text-muted-foreground text-lg">
          Earn 5 DEGEN tokens every day on Base
        </p>
      </div>

      {!isConnected ? (
        <Card className="bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 shadow-lg">
                <span className="text-3xl">🔗</span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Connect Your Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Connect your wallet to access daily DEGEN rewards and start earning crypto passively.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Secure wallet connection required
            </div>
          </CardContent>
        </Card>
      ) : !fid ? (
        <Card className="bg-linear-to-br from-amber-50 to-yellow-100 dark:from-amber-950/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 shadow-lg">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Verifying Farcaster Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We&apos;re checking your Farcaster identity to ensure eligibility for rewards.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              Loading your rewards status...
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <DegenRewardCard fid={fid} />

          {/* How it works section */}
          <Card className="bg-linear-to-br from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <span className="text-2xl">📚</span>
                How Daily Rewards Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold mt-0.5">1</div>
                  <div>
                    <h4 className="font-semibold text-sm">Send GM on Base</h4>
                    <p className="text-xs text-muted-foreground">Post a GM message on Base network today</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold mt-0.5">2</div>
                  <div>
                    <h4 className="font-semibold text-sm">Claim Daily Reward</h4>
                    <p className="text-xs text-muted-foreground">Claim 5 DEGEN tokens once per day</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold mt-0.5">3</div>
                  <div>
                    <h4 className="font-semibold text-sm">Valid Farcaster ID</h4>
                    <p className="text-xs text-muted-foreground">Requires active Farcaster identity</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold mt-0.5">4</div>
                  <div>
                    <h4 className="font-semibold text-sm">Direct to Wallet</h4>
                    <p className="text-xs text-muted-foreground">Tokens sent directly to your wallet</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚡</span>
                  <div>
                    <h4 className="font-semibold text-sm text-yellow-800 dark:text-yellow-200">Pro Tip</h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Make sure to send your GM message before claiming. The system checks your recent activity on Base.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
