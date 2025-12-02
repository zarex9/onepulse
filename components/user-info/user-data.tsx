"use client";

import { memo } from "react";
import { truncateAddress } from "@/lib/ens-utils";

export const UserData = memo(
  ({
    displayName,
    username,
    address,
  }: {
    displayName: string;
    username?: string;
    address?: string;
  }) => {
    const showUsername = username && address === undefined;
    return (
      <div className="flex flex-col gap-1 text-sm leading-none">
        <span className="font-medium">{displayName}</span>
        {showUsername ? (
          <span className="text-muted-foreground">@{username}</span>
        ) : (
          <span className="text-muted-foreground">
            {truncateAddress(address)}
          </span>
        )}
      </div>
    );
  }
);
