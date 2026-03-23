"use client";

import { useState } from "react";
import type { AdminUser } from "../types";

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
}

function UserRowSkeleton() {
  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </td>
    </tr>
  );
}

export function AdminUsersTable({ users, loading }: AdminUsersTableProps) {
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 2000);
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Name
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Email
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Wallet
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Deployments
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <UserRowSkeleton key={i} />
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName ?? user.id}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {(user.displayName || user.email || user.id)
                            .split(/[\s@]/)
                            .slice(0, 2)
                            .map((s) => s[0]?.toUpperCase() ?? "")
                            .join("")}
                        </div>
                      )}
                      <span className="font-medium text-white">
                        {user.displayName || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {user.email ? (
                      <a
                        href={`mailto:${user.email}`}
                        className="hover:text-white/90 underline"
                      >
                        {user.email}
                      </a>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/50 font-mono text-xs">
                    {user.walletAddress ? (
                      <span title={user.walletAddress}>
                        {user.walletAddress.slice(0, 6)}...
                        {user.walletAddress.slice(-4)}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium">
                      {user.deploymentCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/50 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
