"use client";

import type { DashboardDeployment } from "../types";

interface DeploymentsListProps {
  deployments: DashboardDeployment[];
  loading: boolean;
}

function getStatusColor(status: DashboardDeployment["status"]): string {
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

function getStatusLabel(status: DashboardDeployment["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DeploymentSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="h-4 w-32 bg-white/10 rounded mb-2" />
          <div className="h-3 w-48 bg-white/10 rounded" />
        </div>
        <div className="h-6 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="h-5 w-16 bg-white/10 rounded-full" />
        <div className="h-5 w-16 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}

export function DeploymentsList({
  deployments,
  loading,
}: DeploymentsListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Deployments
        </h2>
        {!loading && deployments.length > 0 && (
          <span className="text-sm text-white/50">
            {deployments.length}{" "}
            {deployments.length === 1 ? "deployment" : "deployments"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <DeploymentSkeleton key={i} />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-white/50">No deployments yet</p>
          <p className="text-sm text-white/30 mt-1">
            Create your first deployment to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">
                    {deployment.modelLabel}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    ID: {deployment.id.slice(0, 8)}...
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deployment.status)}`}
                >
                  {getStatusLabel(deployment.status)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/10">
                  {deployment.mode}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/10">
                  {deployment.modelSize}
                </span>
                {deployment.skills.length > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/10">
                    {deployment.skills.length}{" "}
                    {deployment.skills.length === 1 ? "skill" : "skills"}
                  </span>
                )}
              </div>

              {deployment.cloudflareUrl && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-1">Connection:</p>
                  <p className="text-xs font-mono text-white/70 break-all">
                    {deployment.cloudflareUrl}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                <span>
                  Created {new Date(deployment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
