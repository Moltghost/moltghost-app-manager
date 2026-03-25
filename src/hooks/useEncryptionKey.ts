"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SIGN_MESSAGE, deriveKeyFromSignatureBytes } from "../lib/crypto";

const SIG_CACHE_KEY = "moltghost_enc_sig";

/**
 * Hook that derives an AES-256-GCM encryption key from the user's Solana wallet.
 *
 * The user signs a deterministic message once per session. The signature is cached
 * in sessionStorage so subsequent calls (and page refreshes) don't prompt the wallet.
 *
 * Usage:
 *   const { getKey, isReady } = useEncryptionKey();
 *   const key = await getKey(); // prompts wallet signature on first call only
 *   const encrypted = await encrypt("secret", key);
 */
export function useEncryptionKey() {
  const { signMessage, publicKey, connected } = useWallet();
  const keyRef = useRef<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Clear cached key when wallet disconnects
  useEffect(() => {
    if (!connected) {
      keyRef.current = null;
      setIsReady(false);
      sessionStorage.removeItem(SIG_CACHE_KEY);
    }
  }, [connected]);

  const getKey = useCallback(async (): Promise<CryptoKey> => {
    // 1. Return in-memory cached key
    if (keyRef.current) return keyRef.current;

    // 2. Try restoring from sessionStorage (no wallet sign needed)
    const cached = sessionStorage.getItem(SIG_CACHE_KEY);
    if (cached) {
      const sigBytes = Uint8Array.from(atob(cached), (c) => c.charCodeAt(0));
      const key = await deriveKeyFromSignatureBytes(sigBytes);
      keyRef.current = key;
      setIsReady(true);
      return key;
    }

    // 3. No cache — prompt wallet signature (once per session)
    if (!publicKey || !signMessage) {
      throw new Error("No Solana wallet available for encryption");
    }

    const messageBytes = new TextEncoder().encode(SIGN_MESSAGE);
    const sigBytes = await signMessage(messageBytes);

    // Cache signature in sessionStorage
    sessionStorage.setItem(
      SIG_CACHE_KEY,
      btoa(String.fromCharCode(...new Uint8Array(sigBytes))),
    );

    const key = await deriveKeyFromSignatureBytes(new Uint8Array(sigBytes));
    keyRef.current = key;
    setIsReady(true);
    return key;
  }, [signMessage, publicKey]);

  return { getKey, isReady };
}
