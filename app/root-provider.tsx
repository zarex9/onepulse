"use client"

import { type ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import { ColorSchemeSync } from "@/components/providers/color-scheme-sync"
import { MiniAppProvider } from "@/components/providers/miniapp-provider"
import { OnchainKitProvider } from "@/components/providers/onchainkit-provider"
import { SpacetimeDBProvider } from "@/components/providers/spacetimedb-provider"
import { WagmiProvider } from "@/components/providers/wagmi-provider"

export function RootProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <WagmiProvider>
        <OnchainKitProvider>
          <MiniAppProvider>
            <SpacetimeDBProvider>
              {children}
              <ColorSchemeSync />
            </SpacetimeDBProvider>
          </MiniAppProvider>
        </OnchainKitProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
