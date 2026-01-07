"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfoLogic } from "./user-info/use-user-info-logic";
import { UserAvatar } from "./user-info/user-avatar";
import { UserData } from "./user-info/user-data";
import { UserInfoSkeleton } from "./user-info/user-info-skeleton";
import {
  getWalletConnectedDisplay,
  type UserInfoProps,
} from "./user-info/utils";

const WalletLoadingView = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="size-8 rounded-full" />
    <UserInfoSkeleton />
  </div>
);

const WalletConnectedView = ({
  address,
  isConnected,
}: {
  address: `0x${string}`;
  isConnected: boolean;
}) => {
  const { avatarUrl, displayName } = getWalletConnectedDisplay(address);

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        isConnected={isConnected}
        name={displayName}
        url={avatarUrl}
      />
      <UserData address={address} displayName={displayName} />
    </div>
  );
};

export function UserInfo({ address: addressProp }: UserInfoProps) {
  const { address, isConnected, state } = useUserInfoLogic({
    address: addressProp,
  });

  if (state === "hidden") {
    return null;
  }

  if (state === "loading") {
    return <WalletLoadingView />;
  }

  return <WalletConnectedView address={address} isConnected={isConnected} />;
}
