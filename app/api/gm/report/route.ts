import { NextResponse } from "next/server"
import { createPublicClient, http, isAddress, type Address } from "viem"
import { base, celo, optimism } from "viem/chains"

import { dailyGMAbi } from "@/lib/abi/daily-gm"
import { getDailyGmAddress } from "@/lib/constants"
import { callReportGm, getGmRows } from "@/lib/spacetimedb/server-connection"

export const runtime = "nodejs" // require Node for WebSocket client

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      address,
      chainId = 8453,
      fid,
      displayName,
      username,
      txHash,
    } = body as {
      address: string
      chainId?: number
      fid?: number
      displayName?: string
      username?: string
      txHash?: string
    }

    if (!address)
      return NextResponse.json(
        { error: "address is required" },
        { status: 400 }
      )
    if (!isAddress(address))
      return NextResponse.json({ error: "invalid address" }, { status: 400 })
    const contractAddress = getDailyGmAddress(chainId)
    if (!contractAddress)
      return NextResponse.json(
        { error: "DAILY_GM_ADDRESS not configured" },
        { status: 500 }
      )

    // Resolve chain by id (support Base, Celo and Optimism)
    const resolvedChain =
      chainId === celo.id ? celo : chainId === optimism.id ? optimism : base
    const client = createPublicClient({
      chain: resolvedChain,
      transport: http(),
    })

    // Read onchain lastGMDay for the address
    const onchainLastGmDay = await client.readContract({
      address: contractAddress as Address,
      abi: dailyGMAbi,
      functionName: "lastGMDay",
      args: [address as Address],
    })

    const lastGmDayOnchain = Number(onchainLastGmDay)

    const updated = await callReportGm({
      address,
      chainId,
      lastGmDayOnchain,
      txHash,
      fid: typeof fid === "number" ? BigInt(fid) : undefined,
      displayName,
      username,
    })

    const row = updated ?? (await getGmRows(address, chainId)).at(0) ?? null
    if (!row) {
      return NextResponse.json(
        { error: "spacetimedb_update_failed" },
        { status: 500 }
      )
    }
    return NextResponse.json({
      address: row.address,
      currentStreak: row.currentStreak,
      highestStreak: row.highestStreak,
      allTimeGmCount: row.allTimeGmCount,
      lastGmDay: row.lastGmDay,
    })
  } catch (e) {
    console.error("/api/gm/report error", e)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
