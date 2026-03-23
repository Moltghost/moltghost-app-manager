"use client";

import type { DashboardUser } from "../types";

interface UserCardProps {
  user: DashboardUser | null;
  loading: boolean;
}

export function UserCard({ user, loading }: UserCardProps) {
  const displayName = user?.displayName ?? null;
  const email = user?.email ?? null;
  const walletAddress = user?.walletAddress ?? null;
  const identifier = displayName ?? email ?? user?.id ?? "Unknown";
  const initials = identifier
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white tracking-tight">
        Profile
      </h2>
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {loading ? (
          <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse shrink-0" />
        ) : user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border border-white/25 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-white/20 to-white/10 border border-white/25 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-white/90">{initials}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {loading ? (
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-48 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
            </div>
          ) : (
            <>
              {displayName && (
                <p className="text-sm font-semibold text-white truncate">
                  {displayName}
                </p>
              )}
              {email && (
                <p className="text-xs text-white/65 truncate">{email}</p>
              )}
              {walletAddress && (
                <p className="text-xs text-white/50 font-mono truncate">
                  {walletAddress.slice(0, 10)}...
                  {walletAddress.slice(-8)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
