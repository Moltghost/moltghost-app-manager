"use client";
import { PrivyProvider } from "@privy-io/react-auth";

export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#E9DFC8",
        },
        loginMethods: ["email", "google"],
        embeddedWallets: {
          createOnLogin: "off",
          solana: {
            createOnLogin: "all-users",
          },
        },
        solanaClusters: [
          {
            name: "mainnet-beta",
            rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
