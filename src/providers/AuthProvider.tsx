"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "moltghost_jwt";

interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  authenticated: false,
  walletAddress: null,
  login: async () => {},
  logout: () => {},
  getAccessToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore token from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) setToken(stored);
    setReady(true);
  }, []);

  // Clear token when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setToken(null);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }, [connected]);

  const login = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error("Wallet not connected or does not support signing");
    }

    const wallet = publicKey.toBase58();

    // 1. Get nonce from backend
    const nonceRes = await fetch(
      `${API_URL}/api/auth/nonce?wallet=${encodeURIComponent(wallet)}`,
    );
    if (!nonceRes.ok) throw new Error("Failed to get nonce");
    const { nonce } = await nonceRes.json();

    // 2. Sign deterministic message
    const message = `Sign in to MoltGhost\nWallet: ${wallet}\nNonce: ${nonce}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = await signMessage(messageBytes);
    const signature = bs58.encode(signatureBytes);

    // 3. Submit to backend
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, signature, nonce }),
    });
    if (!loginRes.ok) throw new Error("Login failed");
    const { token: jwt } = await loginRes.json();

    // 4. Store token
    setToken(jwt);
    sessionStorage.setItem(TOKEN_KEY, jwt);
  }, [publicKey, signMessage]);

  const logout = useCallback(() => {
    setToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
    disconnect().catch(() => {});
  }, [disconnect]);

  const getAccessToken = useCallback(async () => {
    return token;
  }, [token]);

  const walletAddress = publicKey?.toBase58() ?? null;
  const authenticated = !!token && connected;

  const value = useMemo(
    () => ({
      ready,
      authenticated,
      walletAddress,
      login,
      logout,
      getAccessToken,
    }),
    [ready, authenticated, walletAddress, login, logout, getAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
