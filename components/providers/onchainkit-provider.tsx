"use client";

import { OnchainKitProvider as Provider } from "@coinbase/onchainkit";
import type { ReactNode } from "react";
import "@/styles/onchainkit.css";
import { useOnchainKitProviderLogic } from "./use-onchainkit-provider-logic";

export function OnchainKitProvider({ children }: { children: ReactNode }) {
  const { apiKey, projectId, chain, config, miniKit } =
    useOnchainKitProviderLogic();

  return (
    <Provider
      analytics={false}
      apiKey={apiKey}
      chain={chain}
      config={config}
      miniKit={miniKit}
      projectId={projectId}
    >
      {children}
    </Provider>
  );
}
