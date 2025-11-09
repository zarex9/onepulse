import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";

export function useFrameInitialization() {
  const { isFrameReady, setFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);
}
