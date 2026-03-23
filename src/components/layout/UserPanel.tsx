"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Button } from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface BackendUser {
  id: string;
  walletAddress: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function UserPanel() {
  const { logout, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProfile(await res.json());
      } catch {
        // non-critical — UI falls back gracefully
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessToken]);

  const displayName = profile?.displayName ?? null;
  const email = profile?.email ?? null;
  const identifier = displayName ?? email ?? profile?.id ?? "Unknown";
  const initials = identifier
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex flex-col gap-5 px-5 py-6 w-full sm:w-72">
      {/* Avatar + identity */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse shrink-0" />
        ) : profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border border-white/25 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-white/90">
              {initials}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          {loading ? (
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-28 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
            </div>
          ) : (
            <>
              {displayName && (
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
              )}
              {email && (
                <p className="text-xs text-white/65 truncate">{email}</p>
              )}
              {!displayName && !email && (
                <p className="text-xs text-white/65">No profile info</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-white/[0.12]" />

      {/* Connected wallets */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
          Connected Wallets
        </p>
        {wallets.length === 0 ? (
          <p className="text-xs text-white/50">No wallet connected</p>
        ) : (
          <div className="flex flex-col gap-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.address}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/10 border border-white/15"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-white/60 capitalize">
                    {wallet.walletClientType ?? "privy"}
                  </span>
                  <span className="text-xs font-mono text-white/90 truncate">
                    {wallet.address.slice(0, 4)}…{wallet.address.slice(-4)}
                  </span>
                </div>
                <span className="text-[10px] text-white/55 shrink-0">
                  Solana
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-white/[0.12]" />

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
          User ID
        </p>
        {loading ? (
          <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
        ) : (
          <p className="text-[10px] font-mono text-white/55 break-all leading-relaxed">
            {profile?.id ?? "—"}
          </p>
        )}
      </div>

      <Button
        variant="danger"
        size="sm"
        onClick={logout}
        className="w-full rounded-xl"
      >
        Sign Out
      </Button>
    </div>
  );
}
