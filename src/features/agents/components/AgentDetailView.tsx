"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import MoltghostIcon from "@/components/icons/MoltghostIcon";
import { useSnackbar } from "notistack";
import type { Deployment } from "@/features/deployment/types";
import { deleteDeployment } from "@/features/deployment/services/deploymentService";
import { ConsoleLogsModal } from "@/features/deployment/components/ConsoleLogsModal";
import { AgentSettingsModal } from "./AgentSettingsModal";

/* ─── Status Pill ──────────────────────────────────────────────────────────── */

function StatusPill({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70 bg-white/6 border border-white/8 rounded-full px-3 py-1">
      {icon}
      {children}
    </span>
  );
}

/* ─── Icon Buttons ─────────────────────────────────────────────────────────── */

function ActionButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/6 hover:bg-white/12 border border-white/8 transition-colors cursor-pointer text-white/60 hover:text-white/90"
    >
      {children}
    </button>
  );
}

/* ─── SVG Icons (inline) ───────────────────────────────────────────────────── */

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

function LogIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SettingsGearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function GpuIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}

function ModelIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

/* ─── Agent Detail View ────────────────────────────────────────────────────── */

interface AgentDetailViewProps {
  deployment: Deployment;
  onBack: () => void;
  onUpdated?: (d: Deployment) => void;
}

export function AgentDetailView({
  deployment,
  onBack,
  onUpdated,
}: AgentDetailViewProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const { getAccessToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const isRunning = deployment.status === "running";

  async function handleDelete() {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await deleteDeployment(deployment.id, token);
      setSettingsOpen(false);
      onBack();
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "Failed to delete agent",
        { variant: "error" },
      );
    }
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* Back button above card */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer mb-4 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8L2 12L6 16" />
            <path d="M2 12H22" />
          </svg>
          <span className="text-sm">Back to Agents</span>
        </button>

        <div
          className="relative rounded-3xl overflow-hidden backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(21,21,21,0.5) 0%, rgba(38,38,38,0.25) 100%)",
          }}
        >
          {/* Top edge highlight */}
          <div
            className="absolute inset-x-0 top-0 h-px opacity-80"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,235,248,0.35) 30%, rgba(255,235,248,0.65) 50%, rgba(255,235,248,0.35) 70%, transparent 95%)",
            }}
            aria-hidden
          />

          <div className="relative p-5 sm:p-8 min-h-130 flex flex-col">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
              {/* Left: Logo + Back */}
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer group"
              >
                <MoltghostIcon className="w-8 h-8 text-white/40 group-hover:text-white/60 transition-colors" />
              </button>

              {/* Center: Status pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <StatusPill
                  icon={
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${isRunning ? "bg-green-500" : "bg-red-500"}`}
                    />
                  }
                >
                  {isRunning ? "Agent running" : `Agent ${deployment.status}`}
                </StatusPill>
                <StatusPill>Openclaw 2026.3.9</StatusPill>
                <StatusPill icon={<GpuIcon />}>NVIDIA L4</StatusPill>
                <StatusPill icon={<ModelIcon />}>
                  {deployment.modelId}
                </StatusPill>
              </div>

              {/* Right: Action buttons */}
              <div className="flex flex-col gap-2">
                <ActionButton title="Pause agent">
                  <PauseIcon />
                </ActionButton>
                <ActionButton title="Restart agent">
                  <RestartIcon />
                </ActionButton>
                <ActionButton
                  title="Console logs"
                  onClick={async () => {
                    const t = await getAccessToken();
                    if (t) {
                      setAuthToken(t);
                      setLogsOpen(true);
                    }
                  }}
                >
                  <LogIcon />
                </ActionButton>
                <ActionButton
                  title="Agent settings"
                  onClick={() => setSettingsOpen(true)}
                >
                  <SettingsGearIcon />
                </ActionButton>
              </div>
            </div>

            {/* ── Center Content ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-medium">
                MOLTGHOST
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-white/40">Chatbot UI coming soon</p>
            </div>

            {/* ── Open Dashboard ──────────────────────────────────────────── */}
            {deployment.agentDomain && (
              <div className="w-full max-w-2xl mx-auto flex justify-center">
                <a
                  href={`https://${deployment.agentDomain}${deployment.gatewayToken ? `?token=${deployment.gatewayToken}` : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-white/10 hover:bg-white/16 border border-white/12 hover:border-white/20 text-white/80 hover:text-white transition-all text-sm font-medium tracking-tight"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open Dashboard
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConsoleLogsModal
        isOpen={logsOpen}
        deploymentId={deployment.id}
        token={authToken}
        onClose={() => setLogsOpen(false)}
      />

      {settingsOpen && (
        <AgentSettingsModal
          deployment={deployment}
          onClose={() => setSettingsOpen(false)}
          onDelete={handleDelete}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
