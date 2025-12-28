import type { Address } from "viem";

export type SupportedChain = {
  id: number;
  name: string;
};

export const BASE_CHAIN_ID = 8453;
export const CELO_CHAIN_ID = 42_220;
export const OPTIMISM_CHAIN_ID = 10;

export const SUPPORTED_CHAINS: readonly SupportedChain[] = [
  { id: BASE_CHAIN_ID, name: "Base" },
  { id: CELO_CHAIN_ID, name: "Celo" },
  { id: OPTIMISM_CHAIN_ID, name: "Optimism" },
] as const;

export const DAILY_GM_ADDRESSES: Record<SupportedChain["id"], Address | ""> = {
  [BASE_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_BASE as Address) || "",
  [CELO_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_CELO as Address) || "",
  [OPTIMISM_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS_OPTIMISM as Address) || "",
};

export const DAILY_GM_ADDRESS =
  process.env.NEXT_PUBLIC_DAILY_GM_ADDRESS ||
  DAILY_GM_ADDRESSES[BASE_CHAIN_ID] ||
  "";

export const DAILY_REWARDS_V2_ADDRESSES: Record<number, Address | ""> = {
  [BASE_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_V2_ADDRESS_BASE as Address) || "",
  [CELO_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_V2_ADDRESS_CELO as Address) || "",
  [OPTIMISM_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_DAILY_REWARDS_V2_ADDRESS_OPTIMISM as Address) ||
    "",
};

export const REWARD_TOKENS: Record<number, Address | ""> = {
  [BASE_CHAIN_ID]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  [CELO_CHAIN_ID]: "0x765de816845861e75a25fca122bb6898b8b1282a", // cUSD on Celo
  [OPTIMISM_CHAIN_ID]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC on Optimism
};

export const REWARD_TOKEN_DECIMALS: Record<number, number> = {
  [BASE_CHAIN_ID]: 6, // USDC on Base
  [CELO_CHAIN_ID]: 18, // cUSD on Celo
  [OPTIMISM_CHAIN_ID]: 6, // USDC on Optimism
};

export const REWARD_TOKEN_SYMBOLS: Record<number, string> = {
  [BASE_CHAIN_ID]: "USDC",
  [CELO_CHAIN_ID]: "cUSD",
  [OPTIMISM_CHAIN_ID]: "USDC",
};

export const DEFAULT_CLAIM_REWARD_AMOUNT = "0.01"; // 0.01 USDC/cUSD

export const SECONDS_PER_DAY = 86_400;
export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;

export const DAILY_CLAIM_LIMIT = 250;
