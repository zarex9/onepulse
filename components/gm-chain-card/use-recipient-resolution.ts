import { useMemo } from "react";
import { useEnsBasenameResolver } from "@/hooks/use-ens-basename-resolver";
import { validateRecipient } from "./recipient-validation";

export const useRecipientResolution = (recipient: string) => {
  const sanitizedRecipient = recipient.trim();
  const isRecipientValid = useMemo(
    () => validateRecipient(recipient),
    [recipient]
  );

  const { address: resolvedAddress, isLoading: isResolving } =
    useEnsBasenameResolver(recipient);

  return {
    sanitizedRecipient,
    isRecipientValid,
    resolvedAddress,
    isResolving,
  };
};
