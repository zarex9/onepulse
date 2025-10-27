import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPublicClient, http, isAddress, type Address } from "viem";
import { base } from "viem/chains";
import { dailyGMAbi } from "@/lib/abi/dailyGM";
import { DAILY_GM_ADDRESS } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      address,
      chainId = 8453,
      fid,
      displayName,
      username,
      txHash,
    } = body as {
      address: string;
      chainId?: number;
      fid?: number;
      displayName?: string;
      username?: string;
      txHash?: string;
    };

    if (!address) return NextResponse.json({ error: "address is required" }, { status: 400 });
    if (!isAddress(address)) return NextResponse.json({ error: "invalid address" }, { status: 400 });
    if (!DAILY_GM_ADDRESS) return NextResponse.json({ error: "DAILY_GM_ADDRESS not configured" }, { status: 500 });

    // Create viem public client for Base
    const client = createPublicClient({ chain: base, transport: http() });

    // Read onchain lastGMDay for the address
    const onchainLastGmDay = await client.readContract({
      address: DAILY_GM_ADDRESS as Address,
      abi: dailyGMAbi,
      functionName: "lastGMDay",
      args: [address as Address],
    });

    // Fetch current stats (or create with defaults)
    const existing = await prisma.gmStatsByAddress.findUnique({ where: { address } });

    let currentStreak = existing?.currentStreak ?? 0;
    let highestStreak = existing?.highestStreak ?? 0;
    let allTimeGmCount = existing?.allTimeGmCount ?? 0;
    let lastGmDay = existing?.lastGmDay ?? 0;

    // Normalize bigint to number (contract returns bigint via viem)
    const lastGmDayOnchain = Number(onchainLastGmDay);

    // Idempotent update logic
    if (lastGmDayOnchain > lastGmDay) {
      // Count how many days passed
      const delta = lastGmDayOnchain - lastGmDay;
      if (delta === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1; // streak reset then first day again
      }
      highestStreak = Math.max(highestStreak, currentStreak);
      allTimeGmCount += 1;
      lastGmDay = lastGmDayOnchain;
    }

    const saved = await prisma.gmStatsByAddress.upsert({
      where: { address },
      update: {
        chainId,
        currentStreak,
        highestStreak,
        allTimeGmCount,
        lastGmDay,
        lastTxHash: txHash ?? existing?.lastTxHash ?? null,
        displayName: displayName ?? existing?.displayName ?? null,
        username: username ?? existing?.username ?? null,
        fid: typeof fid === "number" ? BigInt(fid) : existing?.fid ?? null,
      },
      create: {
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
    });

    return NextResponse.json({
      address: saved.address,
      currentStreak: saved.currentStreak,
      highestStreak: saved.highestStreak,
      allTimeGmCount: saved.allTimeGmCount,
      lastGmDay: saved.lastGmDay,
    });
  } catch (e) {
    console.error("/api/gm/report error", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
