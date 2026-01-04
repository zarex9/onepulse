import type { Dispatch, SetStateAction } from "react";
import { BASE_CHAIN_ID, type ChainId, DAILY_GM_ADDRESS } from "@/lib/constants";
import type { Chain } from "./chain-config";
import { ChainSlide } from "./chain-slide";

type ChainListProps = {
  chains: Chain[];
  address?: `0x${string}`;
  isConnected: boolean;
  setActiveModalChainId: (id: ChainId) => void;
  setActiveRefetchFn: Dispatch<
    SetStateAction<(() => Promise<unknown>) | undefined>
  >;
  handleStatus: (status: { chainId: ChainId; hasGmToday: boolean }) => void;
};

export function ChainList({
  chains,
  address,
  isConnected,
  setActiveModalChainId,
  setActiveRefetchFn,
  handleStatus,
}: ChainListProps) {
  return (
    <div className="space-y-4">
      {chains.map((c) => {
        const contractAddress =
          c.id === BASE_CHAIN_ID ? DAILY_GM_ADDRESS : undefined;
        return contractAddress ? (
          <ChainSlide
            address={address}
            chainId={c.id}
            chainName={c.name}
            contractAddress={contractAddress}
            isConnected={isConnected}
            key={c.id}
            onOpenModal={(refetch) => {
              setActiveModalChainId(c.id);
              setActiveRefetchFn(() => refetch);
            }}
            onStatusChange={handleStatus}
          />
        ) : null;
      })}
    </div>
  );
}
