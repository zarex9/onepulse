"use client";

import { OnchainKitProvider as Provider } from "@coinbase/onchainkit";
import type { ReactNode } from "react";
import "@/styles/onchainkit.css";
import { base } from "@wagmi/core/chains";
import { minikitConfig } from "@/minikit.config";

export function OnchainKitProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.ONCHAINKIT_API_KEY;
  const projectId = process.env.ONCHAINKIT_PROJECT_ID;
  const paymaster = process.env.PAYMASTER_ENDPOINT;

  const config = {
    appearance: {
      name: minikitConfig.miniapp.name,
      logo: minikitConfig.miniapp.splashImageUrl,
      mode: "auto" as const,
      theme: "custom" as const,
    },
    wallet: {
      display: "modal" as const,
      preference: "all" as const,
      supportedWallets: {
        rabby: true,
      },
    },
    paymaster,
  };

  const miniKit = {
    enabled: true,
    autoConnect: true,
    notificationProxyUrl: undefined,
  };

  return (
    <Provider
      apiKey={apiKey}
      chain={base}
      config={config}
      miniKit={miniKit}
      projectId={projectId}
    >
      {children}
    </Provider>
  );
}
