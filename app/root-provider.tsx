"use client";

import { SafeArea } from "@coinbase/onchainkit/minikit";

import { QueryClientProvider } from "@tanstack/react-query";
import type { State } from "@wagmi/core";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { MiniAppProvider } from "@/components/providers/miniapp-provider";
import { OnchainKitProvider } from "@/components/providers/onchainkit-provider";
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider";
import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/client";
import { config } from "@/lib/wagmi";

const queryClient = getQueryClient();

export function RootProvider({
  children,
  initialState,
}: Readonly<{
  children: ReactNode;
  initialState: State | undefined;
}>) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider>
          <MiniAppProvider>
            <SpacetimeDBProvider>
              <SafeArea>
                {children}
                <Toaster
                  className="flex justify-center"
                  duration={2000}
                  position="top-center"
                  visibleToasts={1}
                />
              </SafeArea>
            </SpacetimeDBProvider>
          </MiniAppProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
