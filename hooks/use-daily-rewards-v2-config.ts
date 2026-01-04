import {
  BASE_CHAIN_ID,
  DAILY_REWARDS_V2_ADDRESS,
  REWARD_TOKEN,
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOL,
} from "@/lib/constants";

export function useDailyRewardsV2Config() {
  const getChainName = () => "Base";
  const currentContractAddress = DAILY_REWARDS_V2_ADDRESS;
  const currentTokenSymbol = REWARD_TOKEN_SYMBOL;
  const currentTokenDecimals = REWARD_TOKEN_DECIMALS;
  const currentTokenAddress = REWARD_TOKEN;

  return {
    selectedChainId: BASE_CHAIN_ID,
    currentContractAddress,
    currentTokenAddress,
    currentTokenSymbol,
    currentTokenDecimals,
    getChainName,
  };
}
