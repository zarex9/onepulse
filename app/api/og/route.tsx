import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { isAddress } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { fetchFarcasterUser } from "@/lib/farcaster";
import { getGmRows } from "@/lib/spacetimedb/server-connection";

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function getDataFromAddress(address: string) {
  let displayName = formatAddress(address);
  let username = formatAddress(address);
  let pfp: string | null = null;
  let chains: { name: string; count: number }[] = [];

  try {
    const rows = await getGmRows(address);

    // Process chains
    chains = rows
      .map((r) => ({
        name: getChainName(r.chainId),
        count: r.allTimeGmCount ?? 0,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Find FID and fetch Farcaster profile
    const fid = rows.find((r) => r.fid)?.fid;
    if (fid) {
      const fcUser = await fetchFarcasterUser(Number(fid));
      if (fcUser) {
        displayName = fcUser.displayName || fcUser.username || displayName;
        username = fcUser.username || username;
        pfp = fcUser.pfp.url || null;
      }
    }
  } catch (error) {
    console.error("Error fetching GM stats for OG:", error);
  }

  return {
    displayName,
    username,
    pfp,
    chains,
  };
}

async function fetchGMStatusParams(searchParams: URLSearchParams) {
  const address = searchParams.get("address");
  const chainsParam = searchParams.get("chains");

  // If address is provided, fetch data from SpacetimeDB and Farcaster
  if (address && isAddress(address)) {
    return await getDataFromAddress(address);
  }

  // Fallback to legacy parameter format
  const chains = chainsParam
    ? chainsParam.split(",").map((c) => {
        const [name, count] = c.split(":");
        return {
          name: name ? decodeURIComponent(name) : "Unknown",
          count: Number.parseInt(count || "0", 10),
        };
      })
    : [];

  return {
    displayName: searchParams.get("displayName") || "name",
    username: searchParams.get("username") || "username",
    pfp: searchParams.get("pfp") || null,
    chains,
  };
}

function generateProfileSection(
  displayName: string,
  username: string,
  pfp: string | null
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        top: 40,
      }}
    >
      {pfp ? (
        // biome-ignore lint: OG image generation requires img for next/og
        <img
          alt="Profile"
          height={160}
          src={pfp}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)",
          }}
          width={160}
        />
      ) : (
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)",
            color: "white",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#0f172a",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 500,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          @{username}
        </div>
      </div>
    </div>
  );
}

const CHAIN_COLORS: Record<string, { bg: string; border: string }> = {
  base: { bg: "rgba(0, 82, 255, 0.1)", border: "rgba(0, 82, 255, 0.5)" },
  celo: { bg: "rgba(252, 255, 82, 0.1)", border: "rgba(252, 255, 82, 0.5)" },
  optimism: { bg: "rgba(255, 4, 32, 0.1)", border: "rgba(255, 4, 32, 0.5)" },
};

function generateGmStats(chains: { name: string; count: number }[]) {
  const stats = chains.map((chain) => {
    const colors = CHAIN_COLORS[chain.name.toLowerCase()] || {
      bg: "rgba(0, 0, 0, 0.1)",
      border: "rgba(0, 0, 0, 0.5)",
    };
    return {
      ...chain,
      ...colors,
    };
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginTop: 56,
        width: "100%",
        justifyContent: "center",
      }}
    >
      {stats.map((chain) => (
        <div
          key={chain.name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 32px",
            borderRadius: 24,
            background: chain.bg,
            border: `1px solid ${chain.border}`,
            minWidth: 200,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {chain.count}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {chain.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function generateMainOGImage(
  params: Awaited<ReturnType<typeof fetchGMStatusParams>>
) {
  const { displayName, username, pfp, chains } = params;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 1080,
          height: 540,
          borderRadius: 40,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
          padding: "48px 96px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 24,
            fontSize: 16,
            fontWeight: 600,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 2,
            background: "#e2e8f0",
            padding: "6px 16px",
            borderRadius: 100,
          }}
        >
          Daily GM Status
        </div>

        {generateProfileSection(displayName, username, pfp)}
        {generateGmStats(chains)}
      </div>
    </div>
  );
}

function generateFallbackImage() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontSize: 48,
        fontWeight: 800,
        fontFamily: "sans-serif",
        color: "#0f172a",
        letterSpacing: -1,
      }}
    >
      OnePulse - Daily GM Status
    </div>
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = await fetchGMStatusParams(searchParams);

    return new ImageResponse(generateMainOGImage(params), {
      width: 1200,
      height: 800,
    });
  } catch {
    // OG image generation failed - returning fallback image
    return new ImageResponse(generateFallbackImage(), {
      width: 1200,
      height: 800,
    });
  }
}
