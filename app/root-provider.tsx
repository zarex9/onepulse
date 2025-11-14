"use client";

import type { ReactNode } from "react";
import { ColorSchemeSync } from "@/components/providers/color-scheme-sync";
import { MiniAppProvider } from "@/components/providers/miniapp-provider";
import { OnchainKitProvider } from "@/components/providers/onchainkit-provider";
import QueryClientProvider from "@/components/providers/query-client-provider";
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WagmiProvider } from "@/components/providers/wagmi-provider";

export function RootProvider({
  children,
  cookies,
}: Readonly<{
  children: ReactNode;
  cookies: string | null;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <WagmiProvider cookies={cookies}>
        <QueryClientProvider>
          <OnchainKitProvider>
            <MiniAppProvider>
              <SpacetimeDBProvider>
                {children}
                <ColorSchemeSync />
              </SpacetimeDBProvider>
            </MiniAppProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
