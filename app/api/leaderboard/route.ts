import { NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import { fetchFarcasterUser } from "@/lib/farcaster";
import type { DbConnection } from "@/lib/module_bindings";
import type GmStatsByAddressSchema from "@/lib/module_bindings/gm_stats_by_address_table";
import {
  connectServerDbConnection,
  subscribeOnce,
} from "@/lib/spacetimedb/server-connection";

type GmStatsByAddress = Infer<typeof GmStatsByAddressSchema>;

type LeaderboardEntry = {
  address: string;
  displayName: string | null;
  username: string | null;
  fid: bigint | null;
  pfpUrl: string | null;
  allTimeGmCount: number;
  rank: number;
};

function assignRanks(entries: LeaderboardEntry[]): void {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry) {
      entry.rank = i + 1;
    }
  }
}

function sumStatsForRow(
  addrRows: GmStatsByAddress[]
): Omit<LeaderboardEntry, "rank"> | null {
  let totalGm = 0;
  let displayName: string | null = null;
  let username: string | null = null;
  let fid: bigint | null = null;

  for (const row of addrRows) {
    totalGm += row.allTimeGmCount ?? 0;
    if (!displayName && row.displayName) {
      displayName = row.displayName;
    }
    if (!username && row.username) {
      username = row.username;
    }
    if (!fid && row.fid) {
      fid = row.fid;
    }
  }

  if (totalGm === 0 || !fid) {
    return null;
  }

  return {
    address: addrRows[0]?.address ?? "",
    displayName,
    username,
    fid,
    pfpUrl: null,
    allTimeGmCount: totalGm,
  };
}

function aggregateByAddress(rows: GmStatsByAddress[]): LeaderboardEntry[] {
  const addressMap = new Map<string, GmStatsByAddress[]>();

  for (const row of rows) {
    const existing = addressMap.get(row.address) ?? [];
    existing.push(row);
    addressMap.set(row.address, existing);
  }

  const aggregated: LeaderboardEntry[] = [];

  for (const addrRows of addressMap.values()) {
    const summed = sumStatsForRow(addrRows);
    if (summed) {
      aggregated.push({
        ...summed,
        rank: 0,
      });
    }
  }

  aggregated.sort((a, b) => b.allTimeGmCount - a.allTimeGmCount);
  assignRanks(aggregated);

  return aggregated;
}

async function fetchAllGmStats(
  conn: DbConnection
): Promise<GmStatsByAddress[]> {
  const query = "SELECT * FROM gm_stats_by_address";
  await subscribeOnce(conn, [query], 60_000);

  const rows: GmStatsByAddress[] = [];
  const gmStatsTable = conn.db.gmStatsByAddress as {
    iter(): Iterable<GmStatsByAddress>;
  };
  for (const row of gmStatsTable.iter()) {
    rows.push(row);
  }

  return rows;
}

function getEntriesToEnrich(
  leaderboard: LeaderboardEntry[],
  userAddress: string | null,
  limit: number
): LeaderboardEntry[] {
  const top = leaderboard.slice(0, limit);

  if (!userAddress) {
    return top;
  }

  const userInTop = top.some(
    (entry) => entry.address.toLowerCase() === userAddress.toLowerCase()
  );
  if (userInTop) {
    return top;
  }

  const userEntry = leaderboard.find(
    (entry) => entry.address.toLowerCase() === userAddress.toLowerCase()
  );
  return userEntry ? [...top, userEntry] : top;
}

async function enrichWithPfps(
  entries: LeaderboardEntry[]
): Promise<LeaderboardEntry[]> {
  const results = await Promise.all(
    entries.map(async (entry) => {
      if (entry.fid) {
        const fcUser = await fetchFarcasterUser(Number(entry.fid));
        return {
          ...entry,
          pfpUrl: fcUser?.pfp?.url ?? null,
        };
      }
      return entry;
    })
  );
  return results;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitStr = url.searchParams.get("limit");
    const userAddress = url.searchParams.get("user");
    const limit = limitStr ? Math.min(Number.parseInt(limitStr, 10), 100) : 10;

    const conn = await connectServerDbConnection(30_000);

    try {
      const allRows = await fetchAllGmStats(conn);
      const fullLeaderboard = aggregateByAddress(allRows);

      // Get only the entries we need to display
      const entriesToDisplay = getEntriesToEnrich(
        fullLeaderboard,
        userAddress,
        limit
      );

      // Enrich only the entries we'll return
      const enriched = await enrichWithPfps(entriesToDisplay);

      const serializable = enriched.map((entry) => ({
        ...entry,
        fid: entry.fid ? entry.fid.toString() : null,
      }));

      return NextResponse.json({
        leaderboard: serializable,
        total: fullLeaderboard.length,
        timestamp: new Date().toISOString(),
      });
    } finally {
      try {
        conn.disconnect();
      } catch {
        // Silent fail on disconnect
      }
    }
  } catch (error) {
    console.error("[Leaderboard API] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        message,
      },
      { status: 500 }
    );
  }
}
