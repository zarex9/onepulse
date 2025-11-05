"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HowItWorksCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">How It Works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 text-sm">
          <span className="text-muted-foreground font-light">1.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Send GM on Base</h4>
            <p className="text-muted-foreground text-xs">
              Post a GM message on Base network today
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <span className="text-muted-foreground font-light">2.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Claim Daily Reward</h4>
            <p className="text-muted-foreground text-xs">
              Claim 5 DEGEN tokens once per day
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <span className="text-muted-foreground font-light">3.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Valid Farcaster ID</h4>
            <p className="text-muted-foreground text-xs">
              Requires active Farcaster identity
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <span className="text-muted-foreground font-light">4.</span>
          <div className="space-y-1">
            <h4 className="font-medium">Direct to Wallet</h4>
            <p className="text-muted-foreground text-xs">
              Tokens sent directly to your wallet
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
