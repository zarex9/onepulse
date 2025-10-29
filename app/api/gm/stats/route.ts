import { NextRequest, NextResponse } from "next/server"
import { isAddress } from "viem"

import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get("address") || ""
  const chainIdParam = searchParams.get("chainId")
  const chainId = chainIdParam ? Number(chainIdParam) : undefined
  if (!address)
    return NextResponse.json({ error: "address is required" }, { status: 400 })
  if (!isAddress(address))
    return NextResponse.json({ error: "invalid address" }, { status: 400 })

  if (typeof chainId === "number" && !Number.isNaN(chainId)) {
    const stats = await prisma.gmStatsByAddress.findFirst({
      where: { address, chainId },
    })
    if (!stats) {
      return NextResponse.json({
        address,
        currentStreak: 0,
        highestStreak: 0,
        allTimeGmCount: 0,
        lastGmDay: 0,
      })
    }
    return NextResponse.json({
      address: stats.address,
      currentStreak: stats.currentStreak,
      highestStreak: stats.highestStreak,
      allTimeGmCount: stats.allTimeGmCount,
      lastGmDay: stats.lastGmDay,
    })
  } else {
    // If no chainId provided, return totals aggregated across chains
    const aggregates = await prisma.gmStatsByAddress.aggregate({
      where: { address },
      _sum: { allTimeGmCount: true },
      _max: { highestStreak: true, lastGmDay: true },
    })
    if (aggregates) {
      return NextResponse.json({
        address,
        currentStreak: 0, // ambiguous across chains without per-chain context
        highestStreak: aggregates._max?.highestStreak ?? 0,
        allTimeGmCount: aggregates._sum?.allTimeGmCount ?? 0,
        lastGmDay: aggregates._max?.lastGmDay ?? 0,
      })
    }
  }
}
