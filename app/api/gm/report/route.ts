import { NextResponse } from "next/server"
import { createPublicClient, http, isAddress, type Address } from "viem"
import { base, celo, optimism } from "viem/chains"

import { dailyGMAbi } from "@/lib/abi/dailyGM"
import { getDailyGmAddress } from "@/lib/constants"
import { prisma } from "@/lib/prisma"

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

    // Fetch current stats (or create with defaults)
    const existing = await prisma.gmStatsByAddress.findFirst({
      where: { address, chainId },
    })

    let currentStreak = existing?.currentStreak ?? 0
    let highestStreak = existing?.highestStreak ?? 0
    let allTimeGmCount = existing?.allTimeGmCount ?? 0
    let lastGmDay = existing?.lastGmDay ?? 0

    // Normalize bigint to number (contract returns bigint via viem)
    const lastGmDayOnchain = Number(onchainLastGmDay)

    // Idempotent update logic
    if (lastGmDayOnchain > lastGmDay) {
      // Count how many days passed
      const delta = lastGmDayOnchain - lastGmDay
      if (delta === 1) {
        currentStreak += 1
      } else {
        currentStreak = 1 // streak reset then first day again
      }
      highestStreak = Math.max(highestStreak, currentStreak)
      allTimeGmCount += 1
      lastGmDay = lastGmDayOnchain
    }

    const updateData = {
      chainId,
      currentStreak,
      highestStreak,
      allTimeGmCount,
      lastGmDay,
      lastTxHash: txHash ?? existing?.lastTxHash ?? null,
      displayName: displayName ?? existing?.displayName ?? null,
      username: username ?? existing?.username ?? null,
      fid: typeof fid === "number" ? BigInt(fid) : (existing?.fid ?? null),
    }

    const updateRes = await prisma.gmStatsByAddress.updateMany({
      where: { address, chainId },
      data: updateData,
    })

    if (updateRes.count === 0) {
      await prisma.gmStatsByAddress.create({
        data: {
          address,
          chainId,
          currentStreak,
          highestStreak,
          allTimeGmCount,
          lastGmDay,
          lastTxHash: txHash ?? null,
          displayName: displayName ?? null,
          username: username ?? null,
          fid: typeof fid === "number" ? BigInt(fid) : null,
        },
      })
    }

    const saved = await prisma.gmStatsByAddress.findFirst({ where: { address, chainId } })
    if (!saved) {
      return NextResponse.json({ error: "save failed" }, { status: 500 })
    }
    return NextResponse.json({
      address: saved.address,
      currentStreak: saved.currentStreak,
      highestStreak: saved.highestStreak,
      allTimeGmCount: saved.allTimeGmCount,
      lastGmDay: saved.lastGmDay,
    })
  } catch (e) {
    console.error("/api/gm/report error", e)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
