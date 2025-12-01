import { useRecipientResolution } from "./use-recipient-resolution";

type UseGmToModeLogicProps = {
  recipient: string;
};

export function useGmToModeLogic({ recipient }: UseGmToModeLogicProps) {
  const { sanitizedRecipient, isRecipientValid, resolvedAddress, isResolving } =
    useRecipientResolution(recipient);

  return {
    sanitizedRecipient,
    isRecipientValid,
    resolvedAddress,
    isResolving,
  };
}
