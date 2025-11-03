"use client"

import React, { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

interface SuccessReporterProps {
  status: string
  onReported?: () => void
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  chainId: number
}

export const SuccessReporter = React.memo(function SuccessReporter({
  status,
  onReported,
  address,
  refetchLastGmDay,
  chainId,
}: SuccessReporterProps) {
  const didReport = useRef(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status !== "success") return

    const report = async () => {
      if (didReport.current) return
      didReport.current = true

      // Report to API
      if (address) {
        try {
          await fetch("/api/gm/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, chainId }),
          })
        } catch {
          // Silently fail - not critical
        }
      }

      // Invalidate cached stats
      if (address) {
        try {
          await queryClient.invalidateQueries({
            queryKey: ["gm-stats", address],
          })
        } catch {
          // Silently fail
        }
      }

      // Refetch on-chain state
      try {
        await refetchLastGmDay?.()
      } catch {
        // Silently fail
      }

      onReported?.()
    }

    void report()
  }, [status, address, onReported, queryClient, refetchLastGmDay, chainId])

  return null
})
