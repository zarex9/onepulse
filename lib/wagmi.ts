import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import {
  type AppKitNetwork,
  base,
  celo,
  optimism,
} from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { cookieStorage, createStorage, http, injected } from "wagmi";
import { baseAccount } from "wagmi/connectors";
import { minikitConfig } from "@/minikit.config";

export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [base, celo, optimism] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: minikitConfig.miniapp.name,
      appLogoUrl: minikitConfig.miniapp.iconUrl,
      preference: {
        telemetry: false,
      },
    }),
    injected(),
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
});

export const config = wagmiAdapter.wagmiConfig;
