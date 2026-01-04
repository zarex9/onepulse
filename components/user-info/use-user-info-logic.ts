import { useConnection } from "wagmi";
import { determineDisplayState, type UserInfoProps } from "./utils";

export function useUserInfoLogic({
  user,
  address: addressProp,
}: UserInfoProps) {
  const { address: connectedAddress, isConnected } = useConnection();
  const address = (addressProp || connectedAddress) as `0x${string}`;

  const state = determineDisplayState(user, address);

  return {
    address,
    isConnected,
    state,
  };
}
