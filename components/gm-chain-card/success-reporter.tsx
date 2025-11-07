"use client"

import React, { useEffect, useRef } from "react"
import { gmStatsByAddressStore } from "@/stores/gm-store"
import { useQueryClient } from "@tanstack/react-query"

interface SuccessReporterProps {
  status: string
  onReported?: () => void
  address?: string
  refetchLastGmDay?: () => Promise<unknown>
  chainId: number
}

async function reportToApi(address: string, chainId: number) {
  try {
    await fetch("/api/gm/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, chainId }),
    })
  } catch (error) {
    console.error("[SuccessReporter] Report POST failed:", error)
  }
}

async function refreshStats(
  address: string,
  queryClient: ReturnType<typeof useQueryClient>
) {
  try {
    await gmStatsByAddressStore.refreshForAddress(address)
  } catch (error) {
    console.error("[SuccessReporter] refreshForAddress() failed:", error)
  }

  try {
    await queryClient.invalidateQueries({
      queryKey: ["gm-stats", address],
    })
  } catch (error) {
    console.error("[SuccessReporter] Query cache invalidation failed:", error)
  }
}

async function refetchOnChainState(refetchLastGmDay?: () => Promise<unknown>) {
  try {
    await refetchLastGmDay?.()
  } catch (error) {
    console.error("[SuccessReporter] refetchLastGmDay() failed:", error)
  }
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
    if (status !== "success" || !address) return

    const report = async () => {
      if (didReport.current) return
      didReport.current = true

      await reportToApi(address, chainId)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await refreshStats(address, queryClient)
      await refetchOnChainState(refetchLastGmDay)

      onReported?.()
    }

    void report()
  }, [status, address, onReported, queryClient, refetchLastGmDay, chainId])

  return null
})
