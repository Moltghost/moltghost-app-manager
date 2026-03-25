"use client";
import { useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletError } from "@solana/wallet-adapter-base";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./AuthProvider";

import "@solana/wallet-adapter-react-ui/styles.css";

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.mainnet-beta.solana.com";
  const wallets = useMemo(() => [], []);

  const onError = useCallback((error: WalletError) => {
    // Silently ignore user rejections (Cancel button)
    if (error.name === "WalletConnectionError") return;
    console.error("[Wallet]", error.message);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>
          <AuthProvider>
            <SnackbarProvider
              maxSnack={3}
              autoHideDuration={5000}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              {children}
            </SnackbarProvider>
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
