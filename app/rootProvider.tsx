"use client";

import Provider from "@/components/providers/wagmiProvider";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID!}
        chain={base}
        config={{
          appearance: {
            name: process.env.NEXT_PUBLIC_PROJECT_NAME,
            mode: "auto",
          },
          wallet: {
            display: "modal",
            preference: "all",
            supportedWallets: {
              rabby: true,
              trust: true,
              frame: true,
            },
          },
          analytics: false,
        }}
        miniKit={{
          enabled: true,
          autoConnect: true,
          notificationProxyUrl: undefined,
        }}
      >
        {children}
      </OnchainKitProvider>
    </Provider>
  );
}
