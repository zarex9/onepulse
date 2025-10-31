import { NextRequest, NextResponse } from "next/server"
import { isAddress } from "viem"

import { getGmRows } from "@/lib/spacetimedb/server-connection"

export const runtime = "nodejs" // require Node for WebSocket client

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get("address") || ""
  const chainIdParam = searchParams.get("chainId")
  const chainId = chainIdParam ? Number(chainIdParam) : undefined
  if (!address)
    return NextResponse.json({ error: "address is required" }, { status: 400 })
  if (!isAddress(address))
    return NextResponse.json({ error: "invalid address" }, { status: 400 })

  const rows = await getGmRows(address, chainId)
  if (typeof chainId === "number" && !Number.isNaN(chainId)) {
    const stats = rows[0]
    return NextResponse.json({
      address,
      currentStreak: stats?.currentStreak ?? 0,
      highestStreak: stats?.highestStreak ?? 0,
      allTimeGmCount: stats?.allTimeGmCount ?? 0,
      lastGmDay: stats?.lastGmDay ?? 0,
    })
  }

  // No chainId provided: aggregate totals across chains from cached rows
  const allTimeGmCount = rows.reduce(
    (acc, r) => acc + (r.allTimeGmCount ?? 0),
    0
  )
  const highestStreak = rows.reduce(
    (acc, r) => Math.max(acc, r.highestStreak ?? 0),
    0
  )
  const lastGmDay = rows.reduce((acc, r) => Math.max(acc, r.lastGmDay ?? 0), 0)
  return NextResponse.json({
    address,
    currentStreak: 0,
    highestStreak,
    allTimeGmCount,
    lastGmDay,
  })
}
