import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import type { MiniAppContext } from "@/types/miniapp";

type MiniAppProviderContextType = {
  context: MiniAppContext | null;
  isInMiniApp: boolean;
  verifiedFid: number | undefined;
} | null;

async function verifyFidWithQuickAuth(
  token: string | null
): Promise<number | undefined> {
  try {
    const response = await sdk.quickAuth.fetch("/api/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    if (data.success && data.user?.fid) {
      return data.user.fid;
    }
  } catch {
    // Quick Auth verification failed, continue without verified FID
  }
}

async function getToken(): Promise<string | null> {
  try {
    const { token } = await sdk.quickAuth.getToken();
    return token;
  } catch {
    return null;
  }
}

export function useMiniAppProviderLogic() {
  const [miniAppContext, setMiniAppContext] =
    useState<MiniAppProviderContextType>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();

        // Get token first, then use it immediately
        const authJWT = await getToken();

        // Pass the newly fetched token, not the state value
        const verifiedFid = await verifyFidWithQuickAuth(authJWT);

        setMiniAppContext({
          context: context as unknown as MiniAppContext,
          isInMiniApp: inMiniApp,
          verifiedFid,
        });
      } catch {
        // MiniApp initialization failure handled gracefully
        setMiniAppContext({
          context: null,
          isInMiniApp: false,
          verifiedFid: undefined,
        });
      }
    };

    init();
  }, [context]);

  return {
    miniAppContext,
  };
}
