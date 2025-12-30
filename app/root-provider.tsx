"use client";

import { SafeArea } from "@coinbase/onchainkit/minikit";
import type { ReactNode } from "react";
import { MiniAppProvider } from "@/components/providers/miniapp-provider";
import { OnchainKitProvider } from "@/components/providers/onchainkit-provider";
import QueryClientProvider from "@/components/providers/query-client-provider";
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider";
import { WagmiProvider } from "@/components/providers/wagmi-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RootProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <WagmiProvider>
      <QueryClientProvider>
        <OnchainKitProvider>
          <MiniAppProvider>
            <SpacetimeDBProvider>
              <SafeArea>
                <TooltipProvider delayDuration={0}>
                  {children}
                  <Toaster
                    className="flex justify-center"
                    duration={2000}
                    position="top-center"
                    visibleToasts={1}
                  />
                </TooltipProvider>
              </SafeArea>
            </SpacetimeDBProvider>
          </MiniAppProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
