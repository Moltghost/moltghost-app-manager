"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/providers/AuthProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import MoltghostIcon from "@/components/icons/MoltghostIcon";
import { FullScreenScene } from "@/components/layout/FullScreenScene";
import NavGlass from "@/components/layout/NavGlass";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login } = useAuth();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [tab, setTab] = useState("1");
  const [loggingIn, setLoggingIn] = useState(false);

  // Auto-login when wallet connects but not yet authenticated
  useEffect(() => {
    if (connected && !authenticated && ready && !loggingIn) {
      setLoggingIn(true);
      login()
        .catch(() => {})
        .finally(() => setLoggingIn(false));
    }
  }, [connected, authenticated, ready, login, loggingIn]);

  // Still loading
  if (!ready || loggingIn) {
    return (
      <FullScreenScene>
        <div className="flex items-center justify-center min-h-screen">
          <span className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
        </div>
      </FullScreenScene>
    );
  }

  // Not logged in → show login screen
  if (!authenticated) {
    return (
      <FullScreenScene>
        <NavGlass selected={tab} onTabChange={setTab} />
        <div className="w-full min-h-full flex flex-col items-center justify-center">
          <GlassCard className="w-full max-w-sm">
            <div className="flex flex-col items-center text-center px-10 py-12 gap-5">
              <MoltghostIcon width={90} height={90} className="text-white/70" />

              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-semibold text-white/88 tracking-tight">
                  Welcome to MoltGhost
                </h1>
                <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                  Connect your wallet to deploy and manage your AI agents.
                </p>
              </div>

              <Button
                variant="glass"
                size="md"
                onClick={() => setVisible(true)}
                className="rounded-full px-8 mt-1 w-full"
              >
                Connect Wallet
              </Button>
            </div>
          </GlassCard>
        </div>
      </FullScreenScene>
    );
  }

  // Logged in → render app
  return <>{children}</>;
}
