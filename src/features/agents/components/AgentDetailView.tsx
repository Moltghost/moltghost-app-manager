"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import MoltghostIcon from "@/components/icons/MoltghostIcon";
import type { Deployment } from "@/features/deployment/types";
import { deleteDeployment } from "@/features/deployment/services/deploymentService";
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
}

export function AgentDetailView({ deployment, onBack }: AgentDetailViewProps) {
  const [message, setMessage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { getAccessToken } = usePrivy();
  const isRunning = deployment.status === "running";

  async function handleDelete() {
    const token = await getAccessToken();
    if (!token) return;
    await deleteDeployment(deployment.id, token);
    onBack();
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
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
              <p className="text-sm text-white/40">
                How can i help you today ?
              </p>
            </div>

            {/* ── Chat Input ─────────────────────────────────────────────── */}
            <div className="w-full max-w-2xl mx-auto">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(30,30,30,0.6) 0%, rgba(40,40,40,0.35) 100%)",
                }}
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your agent or assign a task..."
                  rows={3}
                  className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/25 px-5 pt-4 pb-12 resize-none outline-none"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/8 hover:bg-white/16 border border-white/10 transition-colors cursor-pointer text-white/50 hover:text-white/80">
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
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <button
                    disabled={!message.trim()}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white disabled:bg-white/20 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={message.trim() ? "#000" : "rgba(255,255,255,0.3)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <AgentSettingsModal
          deployment={deployment}
          onClose={() => setSettingsOpen(false)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
