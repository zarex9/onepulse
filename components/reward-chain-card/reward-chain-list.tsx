import { BASE_CHAIN_ID } from "@/lib/constants";
import { RewardChainCard } from "./reward-chain-card";

type RewardChainListProps = {
  fid: bigint | undefined;
  isConnected: boolean;
  address?: string;
  sponsored?: boolean;
};

export function RewardChainList({
  fid,
  isConnected,
  address,
  sponsored = false,
}: RewardChainListProps) {
  const chains = [{ id: BASE_CHAIN_ID, name: "Base" }];

  return (
    <div className="space-y-4">
      {chains.map((chain) => (
        <RewardChainCard
          address={address}
          chainId={chain.id}
          fid={fid}
          isConnected={isConnected}
          key={chain.id}
          name={chain.name}
          sponsored={sponsored}
        />
      ))}
    </div>
  );
}
