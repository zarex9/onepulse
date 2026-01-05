"use client";

import { GMChainCard } from "@/components/gm-chain-card/gm-chain-card";
import { Countdown } from "./countdown";
import { useHomeLogic } from "./home/use-home-logic";

export const Home = ({ sponsored }: { sponsored?: boolean }) => {
  const { isConnected, address } = useHomeLogic();

  return (
    <div className="my-12 space-y-4">
      <Countdown />

      <GMChainCard
        address={address}
        isConnected={isConnected}
        isSponsored={sponsored}
      />
    </div>
  );
};

Home.displayName = "Home";
