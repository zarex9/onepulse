import type { Address } from "viem/accounts";
import { isAddress } from "viem/utils";
import { useReadErc20Decimals, useReadErc20Symbol } from "@/helpers/contracts";
import type { ChainId } from "@/lib/constants";

type Erc20MetadataResult = {
  decimals: number | undefined;
  symbol: string | undefined;
  isLoading: boolean;
};

export function useErc20Metadata(
  tokenAddress: Address | undefined,
  chainId: ChainId
): Erc20MetadataResult {
  const enabled = isAddress(tokenAddress || "");
  const validAddress = enabled ? (tokenAddress as Address) : undefined;

  const { data: decimalsData, isLoading: loadingDecimals } =
    useReadErc20Decimals({
      address: validAddress,
      chainId,
      query: { enabled },
    });

  const { data: symbolData, isLoading: loadingSymbol } = useReadErc20Symbol({
    address: validAddress,
    chainId,
    query: { enabled },
  });

  return {
    decimals: decimalsData,
    symbol: symbolData,
    isLoading: loadingDecimals || loadingSymbol,
  };
}
