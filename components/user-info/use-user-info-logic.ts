import type { Address } from "viem/accounts";
import { useConnection } from "wagmi";
import { determineDisplayState, type UserInfoProps } from "./utils";

export function useUserInfoLogic({
  user,
  address: addressProp,
}: UserInfoProps) {
  const { address: connectedAddress, isConnected } = useConnection();
  const address = (addressProp || connectedAddress) as Address;

  const state = determineDisplayState(user, address);

  return {
    address,
    isConnected,
    state,
  };
}
