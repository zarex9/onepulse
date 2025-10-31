"use client"

import { useState } from "react"
import { minikitConfig } from "@/minikit.config"
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { base, celo, optimism } from "viem/chains"
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  WagmiProvider,
  type State,
} from "wagmi"
import { baseAccount } from "wagmi/connectors"

export const config = createConfig({
  chains: [base, celo, optimism],
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: minikitConfig.miniapp.name,
      appLogoUrl: minikitConfig.miniapp.iconUrl,
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [optimism.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

export default function Provider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: State
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
