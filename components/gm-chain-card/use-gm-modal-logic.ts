import { useCallback, useState } from "react";
import { useFocusTrap } from "./use-focus-trap";
import { useModalScrollPrevention } from "./use-modal-scroll-prevention";

type UseGMModalLogicProps = {
  isOpen: boolean;
  processing: boolean;
  onClose: () => void;
  setProcessing: (value: boolean) => void;
};

export function useGMModalLogic({
  isOpen,
  processing,
  onClose,
  setProcessing,
}: UseGMModalLogicProps) {
  const [mode, setMode] = useState<"main" | "gmTo">("main");
  const [recipient, setRecipient] = useState("");

  const handleClose = useCallback(() => {
    setMode("main");
    setRecipient("");
    setProcessing(false);
    onClose();
  }, [setProcessing, onClose]);

  const handleBackdropClick = useCallback(() => {
    if (!processing) {
      handleClose();
    }
  }, [processing, handleClose]);

  const dialogRef = useFocusTrap({
    isOpen,
    isProcessing: processing,
    onCloseAction: handleClose,
  });

  useModalScrollPrevention(isOpen);

  return {
    mode,
    setMode,
    recipient,
    setRecipient,
    handleClose,
    handleBackdropClick,
    dialogRef,
  };
}
