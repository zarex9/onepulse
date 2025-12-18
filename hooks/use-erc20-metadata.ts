import { type Address, erc20Abi, isAddress } from "viem";
import { useReadContract } from "wagmi";

type Erc20MetadataResult = {
  decimals: number | undefined;
  symbol: string | undefined;
  isLoading: boolean;
};

export function useErc20Metadata(
  tokenAddress: Address | undefined,
  chainId?: number
): Erc20MetadataResult {
  const enabled = isAddress(tokenAddress || "");
  const validAddress = enabled ? (tokenAddress as Address) : undefined;

  const { data: decimalsData, isLoading: loadingDecimals } = useReadContract({
    address: validAddress,
    abi: erc20Abi,
    functionName: "decimals",
    chainId,
    query: { enabled },
  });

  const { data: symbolData, isLoading: loadingSymbol } = useReadContract({
    address: validAddress,
    abi: erc20Abi,
    functionName: "symbol",
    chainId,
    query: { enabled },
  });

  return {
    decimals: decimalsData,
    symbol: symbolData,
    isLoading: loadingDecimals || loadingSymbol,
  };
}
