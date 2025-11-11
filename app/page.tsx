"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Footer from "@/components/footer";
import { HomeHeader } from "@/components/home-header";
import { HomeTabs } from "@/components/home-tabs";
import { OnboardingModal } from "@/components/onboarding-modal";
import { useMiniAppContext } from "@/components/providers/miniapp-provider";
import { useFrameInitialization } from "@/hooks/use-frame-initialization";
import { useMetaColor } from "@/hooks/use-meta-color";
import { useMiniAppFlow } from "@/hooks/use-miniapp-flow";
import { useOnboardingModal } from "@/hooks/use-onboarding-modal";
import { usePageState } from "@/hooks/use-page-state";
import { useParticlesAnimation } from "@/hooks/use-particles-animation";
import { useSafeAreaStyle } from "@/hooks/use-safe-area-style";

const Particles = dynamic(
  () =>
    import("@/components/ui/particles").then((mod) => ({
      default: mod.Particles,
    })),
  { ssr: false, loading: () => null }
);

function determineOnboardingSaveHandler(
  isFrameReady: boolean,
  inMiniApp: boolean,
  clientAdded: boolean | undefined,
  handleMiniAppAdded: () => void
) {
  const shouldEnableSave = isFrameReady && inMiniApp && clientAdded !== true;
  return shouldEnableSave ? handleMiniAppAdded : undefined;
}

type HomeContentProps = {
  isFrameReady: boolean;
  inMiniApp: boolean;
  handleMiniAppAdded: () => void;
  tab: string;
  setTab: (tab: string) => void;
};

function HomeContent({
  isFrameReady,
  inMiniApp,
  handleMiniAppAdded,
  tab,
  setTab,
}: HomeContentProps) {
  return (
    <div className="mx-auto w-[95%] max-w-lg px-4 py-4">
      <HomeHeader
        inMiniApp={inMiniApp}
        isFrameReady={isFrameReady}
        onMiniAppAdded={handleMiniAppAdded}
      />
      <HomeTabs onTabChange={setTab} tab={tab} />
      <Footer onTabChange={setTab} />
    </div>
  );
}

type HomeBackgroundProps = {
  showParticles: boolean;
  prefersReducedMotion: boolean | null;
  particleQuantity: number;
  metaColor: string;
};

function HomeBackground({
  showParticles,
  prefersReducedMotion,
  particleQuantity,
  metaColor,
}: HomeBackgroundProps) {
  if (!showParticles || prefersReducedMotion) {
    return null;
  }

  return (
    <Particles
      className="absolute inset-0 z-0"
      color={metaColor}
      ease={80}
      quantity={particleQuantity}
      refresh
    />
  );
}

export default function Home() {
  const miniAppContextData = useMiniAppContext();
  const { inMiniApp } = usePageState();
  const { showParticles, prefersReducedMotion } = useParticlesAnimation();
  const safeAreaStyle = useSafeAreaStyle();
  const { metaColor } = useMetaColor();
  const { handleMiniAppAdded } = useMiniAppFlow();
  const { shouldShowOnboarding, dismissOnboarding, canSaveApp } =
    useOnboardingModal();
  const [tab, setTab] = useState("home");

  useFrameInitialization();

  // Optimize particle count based on screen size for better mobile performance
  const particleQuantity = useMemo(() => {
    if (typeof window === "undefined") {
      return 100;
    }
    return window.innerWidth < 768 ? 50 : 100;
  }, []);

  const isFrameReady = miniAppContextData?.context !== null;
  const clientAdded = miniAppContextData?.context?.client?.added;

  const onboardingSaveHandler = determineOnboardingSaveHandler(
    isFrameReady,
    inMiniApp,
    clientAdded,
    handleMiniAppAdded
  );

  return (
    <div style={safeAreaStyle}>
      <HomeContent
        handleMiniAppAdded={handleMiniAppAdded}
        inMiniApp={inMiniApp}
        isFrameReady={isFrameReady}
        setTab={setTab}
        tab={tab}
      />
      <HomeBackground
        metaColor={metaColor}
        particleQuantity={particleQuantity}
        prefersReducedMotion={prefersReducedMotion}
        showParticles={showParticles}
      />
      <OnboardingModal
        canSave={canSaveApp(inMiniApp)}
        onClose={dismissOnboarding}
        onSave={onboardingSaveHandler}
        open={shouldShowOnboarding()}
      />
    </div>
  );
}
