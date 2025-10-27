import { NextRequest, NextResponse } from "next/server"
import { isAddress } from "viem"

import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get("address") || ""
  if (!address)
    return NextResponse.json({ error: "address is required" }, { status: 400 })
  if (!isAddress(address))
    return NextResponse.json({ error: "invalid address" }, { status: 400 })

  const stats = await prisma.gmStatsByAddress.findUnique({ where: { address } })
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
}
