import { unstable_cache } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import type { Infer } from "spacetimedb";
import type {
  DbConnection,
  GmStatsByAddressV2Row,
} from "@/lib/module_bindings";
import {
  connectServerDbConnection,
  subscribeOnce,
} from "@/lib/spacetimedb/server-connection";

type GmStatsByAddress = Infer<typeof GmStatsByAddressV2Row>;

type LeaderboardEntry = {
  address: string;
  displayName: string | null;
  username: string | null;
  fid: bigint | null;
  pfpUrl: string | null;
  primaryWallet: string | null;
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

function extractStringField(
  rows: GmStatsByAddress[],
  key: string
): string | null {
  for (const row of rows) {
    const rowTyped = row as unknown as Record<string, unknown>;
    if (typeof rowTyped[key] === "string") {
      return rowTyped[key] as string;
    }
  }
  return null;
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

  const pfpUrl = extractStringField(addrRows, "pfpUrl");
  const primaryWallet = extractStringField(addrRows, "primaryWallet");

  return {
    address: addrRows[0]?.address ?? "",
    displayName,
    username,
    fid,
    pfpUrl,
    primaryWallet,
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
  const query = "SELECT * FROM gm_stats_by_address_v2";
  await subscribeOnce(conn, [query], 60_000);

  const rows: GmStatsByAddress[] = [];
  const gmStatsTable = conn.db.gmStatsByAddressV2 as {
    iter(): Iterable<GmStatsByAddress>;
  };
  for (const row of gmStatsTable.iter()) {
    rows.push(row);
  }

  return rows;
}

function filterToPrimaryWallets(
  entries: LeaderboardEntry[]
): LeaderboardEntry[] {
  // Group by FID to detect and filter out non-primary wallet entries
  const fidToEntries = new Map<string, LeaderboardEntry[]>();

  for (const entry of entries) {
    const fid = entry.fid?.toString();
    if (fid) {
      const existing = fidToEntries.get(fid) ?? [];
      existing.push(entry);
      fidToEntries.set(fid, existing);
    }
  }

  // For each FID, keep only the primary wallet entry
  const filtered: LeaderboardEntry[] = [];
  for (const sameUserEntries of fidToEntries.values()) {
    // If user has multiple wallet entries, keep only primary
    if (sameUserEntries.length > 1) {
      const primaryEntry = sameUserEntries.find(
        (e) => e.address.toLowerCase() === e.primaryWallet?.toLowerCase()
      );
      if (primaryEntry) {
        filtered.push(primaryEntry);
      }
    } else {
      const entry = sameUserEntries[0];
      if (entry) {
        filtered.push(entry);
      }
    }
  }

  return filtered;
}

type SerializableLeaderboardEntry = Omit<LeaderboardEntry, "fid"> & {
  fid: string | null;
};

const getCachedLeaderboard = unstable_cache(
  async (): Promise<SerializableLeaderboardEntry[]> => {
    const conn = await connectServerDbConnection(30_000);
    try {
      const allRows = await fetchAllGmStats(conn);
      const fullLeaderboard = aggregateByAddress(allRows);
      const filtered = filterToPrimaryWallets(fullLeaderboard);
      assignRanks(filtered);

      return filtered.map((entry) => ({
        ...entry,
        fid: entry.fid ? entry.fid.toString() : null,
      }));
    } finally {
      try {
        conn.disconnect();
      } catch {
        // Silent fail
      }
    }
  },
  ["leaderboard-full-v1"],
  { revalidate: 60, tags: ["leaderboard"] }
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limitStr = url.searchParams.get("limit");
    const userAddress = url.searchParams.get("user");
    const limit = limitStr ? Math.min(Number.parseInt(limitStr, 10), 100) : 10;

    const filtered = await getCachedLeaderboard();

    // Take top 10 from filtered results
    const top10 = filtered.slice(0, limit);

    // Get user's rank if they're not in top 10
    const userRank =
      userAddress &&
      !top10.some((e) => e.address.toLowerCase() === userAddress.toLowerCase())
        ? (filtered.find(
            (entry) => entry.address.toLowerCase() === userAddress.toLowerCase()
          )?.rank ?? null)
        : null;

    // Calculate total count
    const totalCount = filtered.length;

    return NextResponse.json({
      leaderboard: top10,
      userRank,
      total: totalCount,
      timestamp: new Date().toISOString(),
    });
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
