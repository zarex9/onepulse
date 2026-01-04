import { useOnboarding } from "@/hooks/use-onboarding";

export function useMiniAppFlow() {
  const { dismissOnboarding } = useOnboarding();

  const handleMiniAppAdded = () => {
    dismissOnboarding();
  };

  return { handleMiniAppAdded };
}
