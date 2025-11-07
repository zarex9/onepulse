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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const normalizedAddress = normalizeAddress(address)

  // Listen for refresh events and clear fallback cache for this address
  useEffect(() => {
    if (!address || !normalizedAddress) return

    const unsubscribe = gmStatsByAddressStore.onRefresh((refreshedAddress) => {
      if (refreshedAddress.toLowerCase() === normalizedAddress) {
        setFallbackStats(undefined)
        setLastFetchTime(0)
      }
    })

    return unsubscribe
  }, [address, normalizedAddress])

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

        if (latestReady && latestHasData) {
          return
        }

        // Don't fetch more than once every 2 seconds to prevent stale overwrites
        const now = Date.now()
        if (now - lastFetchTime < 2000) {
          return
        }

        const url = new URL("/api/gm/stats", window.location.origin)
        url.searchParams.set("address", address!)
        if (typeof chainId === "number")
          url.searchParams.set("chainId", String(chainId))
        const res = await fetch(url.toString())
        if (res.ok) {
          const json = (await res.json()) as Partial<GmStats>
          setLastFetchTime(now)
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
      } catch (error) {
        console.error(`[useGmStatsFallback] Fallback fetch failed:`, error)
      }
    }, 500)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [address, chainId, normalizedAddress, rowsForAddress, lastFetchTime])

  return fallbackStats
}
