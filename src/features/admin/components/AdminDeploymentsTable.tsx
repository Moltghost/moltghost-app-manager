"use client";

import { useState } from "react";
import type { AdminDeployment } from "../types";

interface AdminDeploymentsTableProps {
  deployments: AdminDeployment[];
  loading: boolean;
}

function getStatusColor(status: AdminDeployment["status"]): string {
  switch (status) {
    case "running":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "pending":
    case "provisioning":
    case "starting":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "stopped":
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    case "failed":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-white/10 text-white/70 border-white/20";
  }
}

function getStatusLabel(status: AdminDeployment["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DeploymentRowSkeleton() {
  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </td>
    </tr>
  );
}

export function AdminDeploymentsTable({
  deployments,
  loading,
}: AdminDeploymentsTableProps) {
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
                Model
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                User
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Mode
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-3 text-left font-semibold text-white/70 text-xs uppercase tracking-widest">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <DeploymentRowSkeleton key={i} />
              ))
            ) : deployments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                  No deployments found
                </td>
              </tr>
            ) : (
              deployments.map((deployment) => (
                <tr
                  key={deployment.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">
                        {deployment.modelLabel}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {deployment.id.slice(0, 8)}...
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white/90">
                        {deployment.userName || "Unknown"}
                      </p>
                      <p className="text-xs text-white/40">
                        {deployment.userEmail ? (
                          <a
                            href={`mailto:${deployment.userEmail}`}
                            className="hover:text-white/60 underline"
                          >
                            {deployment.userEmail}
                          </a>
                        ) : deployment.userWallet ? (
                          <button
                            onClick={() =>
                              handleCopyWallet(deployment.userWallet!)
                            }
                            className="hover:text-blue-400 transition-colors cursor-pointer"
                            title="Click to copy full address"
                          >
                            {copiedWallet === deployment.userWallet
                              ? "✓ Copied"
                              : deployment.userWallet.slice(0, 10)}
                          </button>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium">
                      {deployment.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}
                    >
                      {getStatusLabel(deployment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/50 text-xs">
                    {new Date(deployment.createdAt).toLocaleDateString()}
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
