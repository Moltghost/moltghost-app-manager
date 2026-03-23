"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { DashboardUser, DashboardDeployment } from "../types";
import {
  fetchDashboardUser,
  fetchUserDeployments,
} from "../services/dashboardService";
import { UserCard } from "./UserCard";
import { DeploymentsList } from "./DeploymentsList";

export function DashboardPanel() {
  const { getAccessToken } = usePrivy();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [deployments, setDeployments] = useState<DashboardDeployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        // Fetch user data and deployments in parallel
        const [userData, deploymentsData] = await Promise.all([
          fetchDashboardUser(token),
          fetchUserDeployments(token),
        ]);

        setUser(userData);
        setDeployments(deploymentsData);
      } catch {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessToken]);

  // Calculate stats
  const activeDeployments = deployments.filter((d) =>
    ["pending", "provisioning", "starting", "running"].includes(d.status),
  ).length;

  return (
    <div className="w-full max-w-4xl rounded-3xl overflow-hidden">
      <div className="space-y-6 p-6 sm:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-white/50 mt-1">Manage your AI agent deployments</p>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
                Total Deployments
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                {deployments.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
                Active
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-2">
                {activeDeployments}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
                Failed
              </p>
              <p className="text-2xl font-bold text-red-400 mt-2">
                {deployments.filter((d) => d.status === "failed").length}
              </p>
            </div>
          </div>
        )}

        <div className="h-px bg-white/10" />

        {/* User Card and Deployments List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info - Left Column */}
          <div className="lg:col-span-1">
            <UserCard user={user} loading={loading} />
          </div>

          {/* Deployments List - Right Column */}
          <div className="lg:col-span-2">
            <DeploymentsList deployments={deployments} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
