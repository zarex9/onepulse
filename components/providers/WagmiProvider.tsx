import { createConfig, http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { minikitConfig } from "@/minikit.config";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: minikitConfig.miniapp.name,
      appLogoUrl: minikitConfig.miniapp.iconUrl,
    }),
  ],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
