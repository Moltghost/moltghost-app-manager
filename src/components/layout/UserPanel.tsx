"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Button } from "@/components/ui/Button";

export function UserPanel() {
  const { user, logout } = usePrivy();
  const { wallets } = useSolanaWallets();

  const email = user?.email?.address;
  const googleName = user?.google?.name ?? user?.google?.email ?? null;
  const identifier = email ?? googleName ?? "Unknown";
  const initials = identifier
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex flex-col gap-5 px-6 py-6 w-72">
      {/* Avatar + identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-white/90">
            {initials}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          {googleName && (
            <p className="text-sm font-medium text-white truncate">
              {googleName}
            </p>
          )}
          {email && <p className="text-xs text-white/65 truncate">{email}</p>}
          {!email && !googleName && (
            <p className="text-xs text-white/65">No email linked</p>
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
        <p className="text-[10px] font-mono text-white/55 break-all leading-relaxed">
          {user?.id ?? "—"}
        </p>
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
