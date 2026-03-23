"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { AdminUser, AdminDeployment, AdminStats } from "../types";
import {
  fetchAdminUsers,
  fetchAdminDeployments,
  fetchAdminStats,
} from "../services/adminService";
import { AdminStatsCard } from "./AdminStatsCard";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminDeploymentsTable } from "./AdminDeploymentsTable";

export function AdminDashboard() {
  const { getAccessToken } = usePrivy();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deployments, setDeployments] = useState<AdminDeployment[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setError("Not authenticated");
          return;
        }

        // Fetch all data in parallel
        const [usersData, deploymentsData, statsData] = await Promise.all([
          fetchAdminUsers(token),
          fetchAdminDeployments(token),
          fetchAdminStats(token),
        ]);

        setUsers(usersData);
        setDeployments(deploymentsData);
        setStats(statsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load admin data",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessToken]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">
            Access Denied
          </p>
          <p className="text-white/50">{error}</p>
          <p className="text-white/30 mt-2 text-sm">
            You don't have admin access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background effects */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-900/10 via-black to-purple-900/10 pointer-events-none" />

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-white/50 mt-1">
              Manage all users and deployments
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Stats Cards */}
          <AdminStatsCard stats={stats} loading={loading} />

          {/* Users Table */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Users
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                {loading
                  ? "Loading..."
                  : `${users.length} ${users.length === 1 ? "user" : "users"}`}
              </p>
            </div>
            <AdminUsersTable users={users} loading={loading} />
          </div>

          {/* Deployments Table */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Deployments
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                {loading
                  ? "Loading..."
                  : `${deployments.length} ${deployments.length === 1 ? "deployment" : "deployments"}`}
              </p>
            </div>
            <AdminDeploymentsTable
              deployments={deployments}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
