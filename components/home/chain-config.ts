import {
  type ChainId,
  SUPPORTED_CHAINS,
  type SupportedChain,
} from "@/lib/constants";

export type Chain = SupportedChain;

/**
 * Filter chains by allowlist
 * Returns full list if allowlist is empty/undefined
 */
export const getChainList = (allowedChainIds?: ChainId[]): Chain[] => {
  if (!Array.isArray(allowedChainIds) || allowedChainIds.length === 0) {
    return [...SUPPORTED_CHAINS];
  }
  return SUPPORTED_CHAINS.filter((c) => allowedChainIds.includes(c.id));
};

/**
 * Check if all chains have completed GM for today
 */
export const areAllChainsComplete = (
  chainIds: number[],
  statusMap: Record<number, { hasGmToday: boolean }>
): boolean => {
  if (chainIds.some((id) => statusMap[id] == null)) {
    return false;
  }
  return chainIds.every((id) => statusMap[id]?.hasGmToday);
};
