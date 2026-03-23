"use client";

import type { AdminStats } from "../types";

interface AdminStatsCardProps {
  stats: AdminStats | null;
  loading: boolean;
}

export function AdminStatsCard({ stats, loading }: AdminStatsCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <p className="text-xs text-white/50 uppercase tracking-widest font-medium mb-2">
          Total Users
        </p>
        {loading ? (
          <div className="h-8 w-12 bg-white/10 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-white">
            {stats?.totalUsers ?? 0}
          </p>
        )}
      </div>

      {/* Total Deployments */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <p className="text-xs text-white/50 uppercase tracking-widest font-medium mb-2">
          Total Deployments
        </p>
        {loading ? (
          <div className="h-8 w-12 bg-white/10 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-white">
            {stats?.totalDeployments ?? 0}
          </p>
        )}
      </div>

      {/* Active Deployments */}
      <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
        <p className="text-xs text-emerald-400/70 uppercase tracking-widest font-medium mb-2">
          Active
        </p>
        {loading ? (
          <div className="h-8 w-12 bg-emerald-500/10 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-emerald-400">
            {stats?.activeDeployments ?? 0}
          </p>
        )}
      </div>

      {/* Failed Deployments */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
        <p className="text-xs text-red-400/70 uppercase tracking-widest font-medium mb-2">
          Failed
        </p>
        {loading ? (
          <div className="h-8 w-12 bg-red-500/10 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-red-400">
            {stats?.failedDeployments ?? 0}
          </p>
        )}
      </div>
    </div>
  );
}
