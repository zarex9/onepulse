import {
  type CachedFarcasterUser,
  getCachedFarcasterUser,
  setCachedFarcasterUser,
} from "./kv";

export type FarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
};

export type FarcasterUserResponse = {
  result: {
    user: FarcasterUser;
  };
};

export async function fetchFarcasterUser(
  fid: number
): Promise<FarcasterUser | null> {
  // Check cache first
  const cached = await getCachedFarcasterUser(fid);
  if (cached) {
    return {
      fid: cached.fid,
      username: cached.username,
      displayName: cached.displayName,
      pfp: {
        url: cached.pfpUrl || "",
        verified: false,
      },
    };
  }

  try {
    const response = await fetch(
      `https://api.farcaster.xyz/v2/user?fid=${fid}`
    );
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as FarcasterUserResponse;
    const user = data.result.user;

    // Cache the result
    const cacheData: CachedFarcasterUser = {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfp?.url || null,
    };
    await setCachedFarcasterUser(fid, cacheData);

    return user;
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}
