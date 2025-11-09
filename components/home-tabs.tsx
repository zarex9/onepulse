"use client";

import { GMBase } from "@/components/gm-base";
import { RewardsBase } from "@/components/rewards-base";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMiniAppContext } from "./providers/miniapp-provider";

interface HomeTabsProps {
  tab: string;
  onTabChange: (tab: string) => void;
}

export function HomeTabs({ tab, onTabChange }: HomeTabsProps) {
  const miniAppContext = useMiniAppContext();

  const isInMiniApp = !!miniAppContext?.isInMiniApp;
  const isBaseApp = miniAppContext?.context?.client.clientFid === 309_857;
  const isFarcaster = miniAppContext?.context?.client.clientFid === 1;

  const allowedChainIds = isFarcaster
    ? [8453, 42_220, 10]
    : isBaseApp
      ? [8453, 10]
      : [8453, 42_220, 10];

  return (
    <div className="mt-4 mb-6">
      <Tabs onValueChange={onTabChange} value={tab}>
        <TabsList className="flex h-12 w-full gap-2 rounded-lg border border-border bg-background">
          <TabsTrigger className="data-[state=active]:bg-accent" value="home">
            Home
          </TabsTrigger>
          {isInMiniApp && (
            <TabsTrigger
              className="data-[state=active]:bg-accent"
              value="rewards"
            >
              Rewards
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="home">
          <GMBase allowedChainIds={allowedChainIds} sponsored={isBaseApp} />
        </TabsContent>
        <TabsContent value="rewards">
          <RewardsBase sponsored={isBaseApp} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
