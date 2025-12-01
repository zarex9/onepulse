"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDisconnectLogic } from "./use-disconnect-logic";

export const UserAvatar = memo(
  ({
    url: avatarUrl,
    name: displayName,
    isConnected,
  }: {
    url: string | undefined;
    name: string;
    isConnected: boolean;
  }) => {
    const { disconnectWallet, isLoading } = useDisconnectLogic();

    if (!isConnected) {
      return (
        <Avatar className="size-8">
          <AvatarImage alt={displayName} src={avatarUrl} />
          <AvatarFallback className="text-xs">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full p-0" size="icon" variant="outline">
            <Avatar className="size-8">
              <AvatarImage alt={displayName} src={avatarUrl} />
              <AvatarFallback className="text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            disabled={isLoading}
            inset
            onSelect={() => {
              disconnectWallet();
            }}
            variant="destructive"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
