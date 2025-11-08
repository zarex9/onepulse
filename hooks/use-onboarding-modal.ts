import { useMiniKit } from "@coinbase/onchainkit/minikit"

import { useOnboarding } from "@/hooks/use-onboarding"
import { useMiniAppContext } from "@/components/providers/miniapp-provider"

export function useOnboardingModal() {
  const { isFrameReady } = useMiniKit()
  const miniAppContext = useMiniAppContext()
  const { showOnboardingModal, dismissOnboarding } = useOnboarding()

  const shouldShowOnboarding = () => showOnboardingModal

  const canSaveApp = (inMiniApp: boolean) =>
    Boolean(
      isFrameReady &&
        inMiniApp &&
        miniAppContext?.context?.client.added !== true
    )

  return {
    showOnboardingModal,
    dismissOnboarding,
    shouldShowOnboarding,
    canSaveApp,
  }
}
