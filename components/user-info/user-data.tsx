"use client";

import { getSlicedAddress } from "@/lib/ens-utils";

export function UserData({
  displayName,
  username,
  address,
}: {
  displayName: string;
  username?: string;
  address?: `0x${string}`;
}) {
  const showUsername = username && address === undefined;
  return (
    <div className="flex flex-col gap-1 text-sm leading-none">
      <span className="font-medium">{displayName}</span>
      {showUsername ? (
        <span className="text-muted-foreground">@{username}</span>
      ) : (
        <span className="text-muted-foreground">
          {address ? getSlicedAddress(address) : ""}
        </span>
      )}
    </div>
  );
}
