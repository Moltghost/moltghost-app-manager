"use client";

import { useCallback, useRef, useState } from "react";
import { useSolanaWallets } from "@privy-io/react-auth";
import { deriveEncryptionKey } from "../lib/crypto";

/**
 * Hook that derives an AES-256-GCM encryption key from the user's Solana wallet.
 *
 * The user signs a deterministic message once per session. The key is cached
 * in memory (React ref) and never persisted or sent to any server.
 *
 * Usage:
 *   const { getKey, isReady } = useEncryptionKey();
 *   const key = await getKey(); // prompts wallet signature on first call
 *   const encrypted = await encrypt("secret", key);
 */
export function useEncryptionKey() {
  const { wallets } = useSolanaWallets();
  const keyRef = useRef<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);

  const getKey = useCallback(async (): Promise<CryptoKey> => {
    // Return cached key if already derived
    if (keyRef.current) return keyRef.current;

    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("No Solana wallet available for encryption");
    }

    const key = await deriveEncryptionKey((message: Uint8Array) =>
      wallet.signMessage(message),
    );

    keyRef.current = key;
    setIsReady(true);
    return key;
  }, [wallets]);

  return { getKey, isReady };
}
