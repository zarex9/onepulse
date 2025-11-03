import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { gmStatsByAddressStore } from "@/stores/gm-store"

import { normalizeAddress } from "./gm-stats-helpers"
import type { GmStats } from "./use-gm-stats"

export function useGmStatsSubscription(address?: string | null) {
  useEffect(() => {
    if (!address) return
    gmStatsByAddressStore.subscribeToAddress(address)
  }, [address])

  const snapshot = useSyncExternalStore(
    (cb) => gmStatsByAddressStore.subscribe(cb),
    () => gmStatsByAddressStore.getSnapshot(),
    () => gmStatsByAddressStore.getServerSnapshot()
  )
  return snapshot
}

export function useGmStatsFallback(
  rowsForAddress: import("@/lib/module_bindings").GmStatsByAddress[],
  address?: string | null,
  chainId?: number
) {
  const [fallbackStats, setFallbackStats] = useState<
    | {
        key: string
        stats: GmStats
      }
    | undefined
  >()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const normalizedAddress = normalizeAddress(address)

  useEffect(() => {
    if (!address || !normalizedAddress) return

    const key = `${address}:${chainId ?? "all"}`
    const subReady = gmStatsByAddressStore.isSubscribedForAddress(address)
    const hasSubData =
      typeof chainId === "number"
        ? rowsForAddress.some((r) => r.chainId === chainId)
        : rowsForAddress.length > 0

    if (subReady && hasSubData) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      try {
        const latestRows = gmStatsByAddressStore
          .getSnapshot()
          .filter((r) => r.address.toLowerCase() === normalizedAddress)
        const latestReady =
          gmStatsByAddressStore.isSubscribedForAddress(address)
        const latestHasData =
          typeof chainId === "number"
            ? latestRows.some((r) => r.chainId === chainId)
            : latestRows.length > 0
        if (latestReady && latestHasData) return

        const url = new URL("/api/gm/stats", window.location.origin)
        url.searchParams.set("address", address!)
        if (typeof chainId === "number")
          url.searchParams.set("chainId", String(chainId))
        const res = await fetch(url.toString())
        if (res.ok) {
          const json = (await res.json()) as Partial<GmStats>
          setFallbackStats({
            key,
            stats: {
              currentStreak: json.currentStreak ?? 0,
              highestStreak: json.highestStreak ?? 0,
              allTimeGmCount: json.allTimeGmCount ?? 0,
              lastGmDay: json.lastGmDay ?? 0,
            },
          })
        }
      } catch {
        // Ignore fallback failures
      }
    }, 1500)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [address, chainId, normalizedAddress, rowsForAddress])

  return fallbackStats
}
