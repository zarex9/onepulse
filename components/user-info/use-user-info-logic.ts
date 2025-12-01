import { useAvatar, useName } from "@coinbase/onchainkit/identity";
import { useAppKitAccount } from "@reown/appkit/react";
import type { Address } from "viem";
import { determineDisplayState, type UserInfoProps } from "./utils";

export function useUserInfoLogic({
  user,
  address: addressProp,
}: UserInfoProps) {
  const { address: connectedAddress, isConnected } = useAppKitAccount({
    namespace: "eip155",
  });
  const address = (addressProp || connectedAddress) as Address;

  const { data: ensName, isLoading: isNameLoading } = useName({ address });
  const { data: ensAvatar, isLoading: isAvatarLoading } = useAvatar({
    ensName: ensName || "",
  });

  const isLoading = isNameLoading || isAvatarLoading;
  const state = determineDisplayState(user, address, isLoading);

  return {
    address,
    ensName,
    ensAvatar,
    isConnected,
    state,
  };
}
