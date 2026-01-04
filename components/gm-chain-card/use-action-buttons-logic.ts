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
  const isPlaceholderButtonDisabled =
    !(sanitizedRecipient && isContractReady) || processing;

  return {
    isPlaceholderButtonDisabled,
  };
};
