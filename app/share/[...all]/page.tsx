import type { Metadata } from "next";
import { isAddress } from "viem";
import { SUPPORTED_CHAINS } from "@/lib/constants";
import { getUserShareData } from "@/lib/kv";
import { generateGMStatusOGUrl } from "@/lib/og-utils";
import { getGmRows } from "@/lib/spacetimedb/server-connection";
import { minikitConfig } from "@/minikit.config";

type Props = {
  params: Promise<{ all: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name || "Unknown";
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function fetchGmStats(address: string) {
  try {
    const rows = await getGmRows(address);
    const allTimeGmCount = rows.reduce(
      (acc, r) => acc + (r.allTimeGmCount ?? 0),
      0
    );
    const chains = rows
      .map((r) => ({
        name: getChainName(r.chainId),
        count: r.allTimeGmCount ?? 0,
      }))
      .filter((c) => c.count > 0);

    return { chains, allTimeGmCount };
  } catch {
    return { chains: [], allTimeGmCount: 0 };
  }
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = await searchParams;
  const address = (sp.address as string) || "";

  if (!isAddress(address)) {
    return {
      title: minikitConfig.miniapp.name,
      description: minikitConfig.miniapp.description,
    };
  }

  const gmStats = await fetchGmStats(address);
  const userData = await getUserShareData(address);

  const shortAddress = formatAddress(address);
  const displayName = userData?.displayName || shortAddress;
  const username = userData?.username || shortAddress;
  const pfp = userData?.pfp || undefined;

  const ogImageUrl = generateGMStatusOGUrl({
    username,
    displayName,
    pfp,
    chains: gmStats.chains,
  });

  const frame = {
    version: minikitConfig.miniapp.version,
    imageUrl: ogImageUrl,
    button: {
      title: "Open OnePulse",
      action: {
        type: "launch_frame",
        name: minikitConfig.miniapp.name,
        url: minikitConfig.miniapp.homeUrl,
        splashImageUrl: minikitConfig.miniapp.splashImageUrl,
        splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      },
    },
  };

  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    openGraph: {
      images: [ogImageUrl],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
      "fc:miniapp": JSON.stringify(frame),
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const sp = await searchParams;
  const address = (sp.address as string) || "";
  const userData = await getUserShareData(address);

  const shortAddress = formatAddress(address);
  const displayName = userData?.displayName || shortAddress;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 font-bold text-2xl">GM from {displayName}!</h1>
      <p className="text-muted-foreground">
        Open OnePulse to see full stats and join the movement.
      </p>
    </div>
  );
}
