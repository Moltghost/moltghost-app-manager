"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "moltghost_jwt";

/** Decode JWT payload and check if it's still valid (not expired). */
function isTokenValid(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

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
  const wasConnected = useRef(false);

  // Restore token from localStorage on mount (discard if expired)
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && isTokenValid(stored)) {
      setToken(stored);
    } else if (stored) {
      localStorage.removeItem(TOKEN_KEY);
    }
    setReady(true);
  }, []);

  // Track connection state — only clear token on real disconnect (true → false)
  useEffect(() => {
    if (connected) {
      wasConnected.current = true;
    } else if (wasConnected.current) {
      // Wallet was connected and now disconnected
      wasConnected.current = false;
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [connected]);

  const login = useCallback(async () => {
    // Skip if already authenticated with a valid token
    if (token && isTokenValid(token)) return;

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
    localStorage.setItem(TOKEN_KEY, jwt);
  }, [publicKey, signMessage, token]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
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
