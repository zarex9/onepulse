import { useMemo } from "react";

type UseActionButtonsLogicProps = {
  sanitizedRecipient: string;
  isContractReady: boolean;
  processing: boolean;
};

export const useActionButtonsLogic = ({
  sanitizedRecipient,
  isContractReady,
  processing,
}: UseActionButtonsLogicProps) => {
  const isPlaceholderButtonDisabled = useMemo(
    () => !(sanitizedRecipient && isContractReady) || processing,
    [sanitizedRecipient, isContractReady, processing]
  );

  return {
    isPlaceholderButtonDisabled,
  };
};
