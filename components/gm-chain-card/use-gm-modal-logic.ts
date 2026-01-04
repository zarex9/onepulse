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
  const handleClose = () => {
    setProcessing(false);
    onClose();
  };

  const handleBackdropClick = () => {
    if (!processing) {
      handleClose();
    }
  };

  const dialogRef = useFocusTrap({
    isOpen,
    isProcessing: processing,
    onCloseAction: handleClose,
  });

  useModalScrollPrevention(isOpen);

  return {
    handleClose,
    handleBackdropClick,
    dialogRef,
  };
}
