import type { Address } from "viem/accounts";
import { getSlicedAddress } from "@/lib/ens-utils";
import type { UserContext } from "@/types/miniapp";

export type UserInfoProps = {
  user?: UserContext;
  address?: Address | string;
};

export const getAvatarUrl = (userPfp: string | undefined): string | undefined =>
  userPfp || undefined;

export const getDisplayName = (
  userDisplayName: string | undefined,
  address: `0x${string}`
): string => userDisplayName || getSlicedAddress(address);

export const getMiniAppUserDisplay = (user: UserInfoProps["user"]) => ({
  displayName: user?.displayName || "Unknown",
  avatarUrl: user?.pfpUrl || undefined,
  username: user?.username,
});

export const getWalletConnectedDisplay = (
  user: UserInfoProps["user"],
  address: Address
) => ({
  avatarUrl: getAvatarUrl(user?.pfpUrl),
  displayName: getDisplayName(user?.displayName, address),
});

export type DisplayState = "hidden" | "miniapp" | "loading" | "wallet";

export const determineDisplayState = (
  user: UserInfoProps["user"],
  address: Address | undefined
): DisplayState => {
  const hasIdentity = Boolean(user || address);
  if (!hasIdentity) {
    return "hidden";
  }
  if (address && !user) {
    return "wallet";
  }
  return "miniapp";
};
