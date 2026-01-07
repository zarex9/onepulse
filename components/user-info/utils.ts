import { getSlicedAddress } from "@/lib/ens-utils";

export type UserInfoProps = {
  address?: `0x${string}` | string;
};

type AvatarUrlResult = string | undefined;

type WalletConnectedDisplayResult = {
  avatarUrl: string | undefined;
  displayName: string;
};

export function getAvatarUrl(userPfp: string | undefined): AvatarUrlResult {
  return userPfp || undefined;
}

export function getDisplayName(address: `0x${string}`): string {
  return getSlicedAddress(address);
}

export function getWalletConnectedDisplay(
  address: `0x${string}`
): WalletConnectedDisplayResult {
  return {
    avatarUrl: getAvatarUrl(undefined),
    displayName: getDisplayName(address),
  };
}

export type DisplayState = "hidden" | "loading" | "wallet";

export function determineDisplayState(
  address: `0x${string}` | undefined
): DisplayState {
  const hasIdentity = Boolean(address);
  if (!hasIdentity) {
    return "hidden";
  }
  return "wallet";
}
