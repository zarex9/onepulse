"use client";

import type { JSX } from "react";
import { Icons } from "@/components/icons";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
} from "@/components/ui/item";
import { ActionButton } from "./action-button";
import { StatsDisplay } from "./stats-display";
import { useGMChainCardLogic } from "./use-gm-chain-card-logic";

export type GMChainCardProps = {
  isConnected: boolean;
  address?: `0x${string}`;
  isSponsored?: boolean;
};

export function GMChainCard({
  isConnected,
  address,
  isSponsored = false,
}: GMChainCardProps): JSX.Element {
  const {
    onCorrectChain,
    hasGmToday,
    gmDisabled,
    chainBtnClasses,
    chainIconName,
    processing,
    setProcessing,
  } = useGMChainCardLogic({
    isConnected,
    address,
  });

  return (
    <Item variant="outline">
      <ItemContent className="items-start">
        <ItemMedia>
          {Icons[chainIconName as keyof typeof Icons]?.({
            className: "h-8 w-24 text-current",
            role: "img",
            "aria-label": "Base wordmark",
            focusable: false,
          })}
        </ItemMedia>
      </ItemContent>
      <ItemActions>
        <StatsDisplay address={address} isConnected={isConnected} />
      </ItemActions>
      <ItemFooter className="flex-col">
        <ActionButton
          address={address}
          chainBtnClasses={chainBtnClasses}
          gmDisabled={gmDisabled}
          hasGmToday={hasGmToday}
          isConnected={isConnected}
          isSponsored={isSponsored}
          onCorrectChain={onCorrectChain}
          processing={processing}
          setProcessingAction={setProcessing}
        />
      </ItemFooter>
    </Item>
  );
}
