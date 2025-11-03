import type { GmStats } from "@/hooks/use-gm-stats"
import { Spinner } from "@/components/ui/spinner"

export function ProfileStats({
  stats,
  defaultStats,
  isReady,
  address,
}: {
  stats: GmStats | undefined
  defaultStats: GmStats
  isReady: boolean
  address?: string | null
}) {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-2xl font-semibold">
          {(stats ?? defaultStats).currentStreak}
        </div>
        <div className="text-muted-foreground text-xs">Current</div>
      </div>
      <div>
        <div className="text-2xl font-semibold">
          {(stats ?? defaultStats).highestStreak}
        </div>
        <div className="text-muted-foreground text-xs">Highest</div>
      </div>
      <div>
        <div className="text-2xl font-semibold">
          {(stats ?? defaultStats).allTimeGmCount}
        </div>
        <div className="text-muted-foreground text-xs">All-time</div>
      </div>
      {!isReady && address && (
        <div className="text-muted-foreground col-span-3 mt-3 flex items-center gap-2 text-xs">
          <Spinner className="size-3" />
          <span>Updating…</span>
        </div>
      )}
    </div>
  )
}
