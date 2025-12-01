import { minikitConfig } from "@/minikit.config";

/**
 * Generate OG image URL for GM status sharing
 */
export function generateGMStatusOGUrl(params: {
  username?: string;
  displayName?: string;
  pfp?: string;
  chains?: { name: string; count: number }[];
}): string {
  const baseUrl = `${minikitConfig.miniapp.homeUrl}`;
  const searchParams = new URLSearchParams();

  const paramMappings = [
    { key: "username", value: params.username },
    { key: "displayName", value: params.displayName },
    { key: "pfp", value: params.pfp },
  ];

  for (const { key, value } of paramMappings) {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  if (params.chains) {
    const chainsStr = params.chains
      .map((c) => `${encodeURIComponent(c.name)}:${c.count}`)
      .join(",");
    searchParams.set("chains", chainsStr);
  }

  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * Generate Share Page URL
 */
export function generateSharePageUrl(params: {
  username?: string;
  displayName?: string;
  pfp?: string;
  chains?: { name: string; count: number }[];
}): string {
  const baseUrl = `${minikitConfig.miniapp.homeUrl}`;
  const searchParams = new URLSearchParams();

  const paramMappings = [
    { key: "username", value: params.username },
    { key: "displayName", value: params.displayName },
    { key: "pfp", value: params.pfp },
  ];

  for (const { key, value } of paramMappings) {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  if (params.chains) {
    const chainsStr = params.chains
      .map((c) => `${encodeURIComponent(c.name)}:${c.count}`)
      .join(",");
    searchParams.set("chains", chainsStr);
  }

  return `${baseUrl}/share/view?${searchParams.toString()}`;
}
