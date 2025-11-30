/**
 * Generate OG image URL for GM status sharing
 */
export function generateGMStatusOGUrl(params: {
  username?: string;
  displayName?: string;
  pfp?: string;
  todayGM?: boolean;
  claimedToday?: boolean;
  basegm?: number;
  celogm?: number;
  optimismgm?: number;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const searchParams = new URLSearchParams();

  const paramMappings = [
    { key: "username", value: params.username },
    { key: "displayName", value: params.displayName },
    { key: "pfp", value: params.pfp },
    { key: "basegm", value: params.basegm?.toString() },
    { key: "celogm", value: params.celogm?.toString() },
    { key: "optimismgm", value: params.optimismgm?.toString() },
  ];

  for (const { key, value } of paramMappings) {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * Generate metadata for sharing GM status
 */
export function generateGMStatusMetadata(params: {
  username?: string;
  displayName?: string;
  pfp?: string;
  streak?: number;
  totalGMs?: number;
  chains?: string[];
  todayGM?: boolean;
  claimedToday?: boolean;
  basegm?: number;
  celogm?: number;
  optimismgm?: number;
}) {
  const imageUrl = generateGMStatusOGUrl(params);
  const username = params.username || "user";
  const streak = params.streak || 0;
  const claimedToday = params.claimedToday;

  const achievementText = claimedToday
    ? "just claimed their daily DEGEN rewards!"
    : `is on a ${streak}-day GM streak`;

  return {
    title: `${username}'s GM Achievement`,
    description: `${username} ${achievementText}. Join the daily GM movement with OnePulse!`,
    image: imageUrl,
    url: imageUrl,
  };
}
