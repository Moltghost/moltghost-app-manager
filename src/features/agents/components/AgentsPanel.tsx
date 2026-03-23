"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { GlassCard } from "@/components/ui/GlassCard";
import MoltghostIcon from "@/components/icons/MoltghostIcon";
import { getDeployments } from "@/features/deployment/services/deploymentService";
import { useSnackbar } from "notistack";
import { AgentDetailView } from "./AgentDetailView";
import type { Deployment } from "@/features/deployment/types";

/* ─── Status badge ─────────────────────────────────────────────────────────── */

function StatusDot({ status }: { status: Deployment["status"] }) {
  const color =
    status === "running"
      ? "bg-green-500"
      : status === "failed"
        ? "bg-red-500"
        : status === "stopped"
          ? "bg-white/30"
          : "bg-yellow-400 animate-pulse";

  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${color} shrink-0`}
      title={status}
    />
  );
}

/* ─── Tag pill ─────────────────────────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] text-white/70 bg-white/8 border border-white/10 rounded-full px-3 py-1">
      {children}
    </span>
  );
}

/* ─── Agent Card ───────────────────────────────────────────────────────────── */

function AgentCard({
  deployment,
  onClick,
}: {
  deployment: Deployment;
  onClick: () => void;
}) {
  const isRunning = deployment.status === "running";

  return (
    <GlassCard
      className="rounded-3xl! overflow-hidden w-full"
      onClick={onClick}
    >
      <div className="p-5 sm:p-6 flex flex-col gap-4 min-h-50">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <MoltghostIcon className="w-8 h-8 text-white/60 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                {deployment.modelLabel}
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                {deployment.mode === "dedicated"
                  ? "Dedicated Agent"
                  : deployment.mode === "shared"
                    ? "Shared Agent"
                    : "External Agent"}
              </p>
            </div>
          </div>
          <StatusDot status={deployment.status} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Tag>NVIDIA L4</Tag>
          <Tag>{deployment.modelLabel}</Tag>
        </div>

        {/* Info */}
        <div className="mt-auto space-y-2">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">
              Domain
            </p>
            <p className="text-xs text-white/60 truncate">
              {deployment.agentDomain ?? "—"}
            </p>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">
                Status
              </p>
              <p className="text-xs text-white/70 capitalize">
                {deployment.status}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">
                Mode
              </p>
              <p className="text-xs text-white/70 capitalize">
                {deployment.mode}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            {isRunning ? (
              <span className="text-[11px] text-green-400 font-medium">
                ● Live
              </span>
            ) : (
              <span className="text-[11px] text-white/30 capitalize">
                {deployment.status}
              </span>
            )}
          </div>
          {deployment.agentDomain && isRunning && (
            <a
              href={`https://${deployment.agentDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/8 hover:bg-white/16 transition-colors"
            >
              <span className="text-white/70 text-sm">→</span>
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

/* ─── Deploy More Card ─────────────────────────────────────────────────────── */

function DeployMoreCard({ onClick }: { onClick: () => void }) {
  return (
    <GlassCard
      className="rounded-3xl! overflow-hidden w-full cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      <div className="p-5 sm:p-6 flex flex-col items-center justify-center gap-3 min-h-50">
        <span className="text-3xl text-white/40">+</span>
        <p className="text-sm font-semibold text-white/60">Deploy More</p>
      </div>
    </GlassCard>
  );
}

/* ─── Main Panel ───────────────────────────────────────────────────────────── */

interface AgentsPanelProps {
  onNavigate?: (tab: string) => void;
  initialAgent?: Deployment | null;
  onInitialAgentConsumed?: () => void;
}

export function AgentsPanel({
  onNavigate,
  initialAgent,
  onInitialAgentConsumed,
}: AgentsPanelProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Deployment | null>(null);
  const { getAccessToken } = usePrivy();
  const { enqueueSnackbar } = useSnackbar();

  // If an initialAgent is passed (from deployment), open its detail view immediately
  useEffect(() => {
    if (initialAgent) {
      setSelectedAgent(initialAgent);
      onInitialAgentConsumed?.();
    }
  }, [initialAgent, onInitialAgentConsumed]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const token = await getAccessToken();
        if (!token || !active) return;
        const data = await getDeployments(token);
        if (active) setDeployments(data);
      } catch (err) {
        enqueueSnackbar(
          err instanceof Error ? err.message : "Failed to load agents",
          { variant: "error" },
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [getAccessToken]);

  if (selectedAgent) {
    return (
      <AgentDetailView
        deployment={selectedAgent}
        onBack={async () => {
          // Re-fetch first so the grid is up-to-date before we show it
          try {
            const token = await getAccessToken();
            if (token) {
              const data = await getDeployments(token);
              setDeployments(data);
            }
          } catch {}
          setSelectedAgent(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-white/40 animate-pulse">Loading agents...</p>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <MoltghostIcon className="w-12 h-12 text-white/60" />
        <p className="text-sm text-white">No agents deployed yet.</p>
        <p className="text-xs text-white/70">
          Go to the Home tab to deploy your first agent.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deployments.map((d) => (
          <AgentCard
            key={d.id}
            deployment={d}
            onClick={() => setSelectedAgent(d)}
          />
        ))}
        <DeployMoreCard onClick={() => onNavigate?.("1")} />
      </div>
    </div>
  );
}
