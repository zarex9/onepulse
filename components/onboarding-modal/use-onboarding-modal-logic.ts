import { useCallback } from "react";

export function useOnboardingModalLogic(
  onClose: () => void,
  onSave?: () => void
) {
  const handleSaveAndClose = useCallback(() => {
    onSave?.();
    onClose();
  }, [onSave, onClose]);

  return {
    handleSaveAndClose,
  };
}
