import { http, createConfig, webSocket } from "wagmi";
import { etherlinkTestnet, foundry } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [foundry /*etherlinkTestnet*/],
  connectors: [
    injected(),
    // coinbaseWallet({ appName: "Create Wagmi" }),
    // walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  ssr: true,
  transports: {
    [foundry.id]: http(),
    // [etherlinkTestnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
