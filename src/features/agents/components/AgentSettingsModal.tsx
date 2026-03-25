"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useSnackbar } from "notistack";
import { Switch } from "@/components/ui/Switch";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { updateDeployment } from "@/features/deployment/services/deploymentService";
import { useEncryptionKey } from "@/hooks/useEncryptionKey";
import { encrypt, decrypt } from "@/lib/crypto";
import type { Deployment } from "@/features/deployment/types";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type Section =
  | "general"
  | "model"
  | "skills"
  | "memory"
  | "notifications"
  | "autosleep";

interface NavItem {
  key: Section;
  label: string;
  icon: React.ReactNode;
}

/* ─── Section Icons ────────────────────────────────────────────────────────── */

function GeneralIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function ModelGpuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
    </svg>
  );
}

function SkillsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
      <path d="M20.66 7A10 10 0 0 0 17 3.34" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function AutoSleepIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ─── Nav Items ────────────────────────────────────────────────────────────── */

const NAV_ITEMS: NavItem[] = [
  { key: "general", label: "General", icon: <GeneralIcon /> },
  { key: "model", label: "Model & GPU", icon: <ModelGpuIcon /> },
  { key: "skills", label: "Skills", icon: <SkillsIcon /> },
  { key: "memory", label: "Memory & Behavior", icon: <MemoryIcon /> },
  { key: "notifications", label: "Notifications", icon: <NotificationsIcon /> },
  { key: "autosleep", label: "Auto Sleep", icon: <AutoSleepIcon /> },
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm text-white/80 text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
}: {
  label: string;
  description?: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-white/80">{label}</span>
        {description && (
          <span className="text-xs text-white/35">{description}</span>
        )}
      </div>
      <Switch checked={checked} onChange={() => {}} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium mb-4">
      {children}
    </h3>
  );
}

/* ─── Section Components ───────────────────────────────────────────────────── */

function GeneralSection({
  deployment,
  onDeleteClick,
  onUpdated,
}: {
  deployment: Deployment;
  onDeleteClick: () => void;
  onUpdated?: (d: Deployment) => void;
}) {
  const [name, setName] = useState(deployment.agentName ?? "");
  const [desc, setDesc] = useState(deployment.agentDescription ?? "");
  const [saving, setSaving] = useState(false);
  const [decrypting, setDecrypting] = useState(deployment.isEncrypted);
  const { getAccessToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { getKey } = useEncryptionKey();

  // Decrypt values on mount for encrypted deployments
  useEffect(() => {
    if (!deployment.isEncrypted) return;
    let cancelled = false;
    (async () => {
      try {
        const key = await getKey();
        const decName = deployment.agentName
          ? await decrypt(deployment.agentName, key)
          : "";
        const decDesc = deployment.agentDescription
          ? await decrypt(deployment.agentDescription, key)
          : "";
        if (!cancelled) {
          setName(decName);
          setDesc(decDesc);
          setDecrypting(false);
        }
      } catch {
        if (!cancelled) setDecrypting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deployment, getKey]);

  const hasChanges =
    name !== (deployment.agentName ?? "") ||
    desc !== (deployment.agentDescription ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      // Re-encrypt before saving
      const key = await getKey();
      const encName = name ? await encrypt(name, key) : "";
      const encDesc = desc ? await encrypt(desc, key) : "";

      const updated = await updateDeployment(
        deployment.id,
        {
          agentName: encName,
          agentDescription: encDesc,
          isEncrypted: true,
          encryptionVersion: "v1",
        },
        token,
      );

      // Pass decrypted version to parent for display
      onUpdated?.({ ...updated, agentName: name, agentDescription: desc });
      enqueueSnackbar("Agent updated", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : "Failed to update", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  const created = new Date(deployment.createdAt);
  const statusColor =
    deployment.status === "running"
      ? "text-green-400"
      : deployment.status === "failed"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div className="space-y-8">
      {/* Agent Identity */}
      <div>
        <SectionTitle>Agent Identity</SectionTitle>
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5 py-4 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder={decrypting ? "Decrypting…" : "Agent name"}
              disabled={decrypting}
              className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-lg px-3 py-2 placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50">
              Description
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={200}
              placeholder={decrypting ? "Decrypting…" : "Short description"}
              disabled={decrypting}
              className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-lg px-3 py-2 placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors disabled:opacity-50"
            />
          </div>
          {hasChanges && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white/10 text-white border border-white/15 hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>Agent Information</SectionTitle>
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
          <InfoRow
            label="Agent ID"
            value={
              <code className="text-xs font-mono">
                {deployment.id.slice(0, 12)}...
              </code>
            }
          />
          <InfoRow label="Domain" value={deployment.agentDomain ?? "—"} />
          <InfoRow
            label="Status"
            value={<span className={statusColor}>{deployment.status}</span>}
          />
          <InfoRow label="Mode" value={deployment.mode} />
          <InfoRow
            label="Created"
            value={created.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 font-medium">
                Delete this agent
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                Once deleted, this agent and all its data will be permanently
                removed.
              </p>
            </div>
            <button
              onClick={onDeleteClick}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors cursor-pointer"
            >
              Delete Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelGpuSection({ deployment }: { deployment: Deployment }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Model Configuration</SectionTitle>
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
          <InfoRow label="Model" value={deployment.modelLabel} />
          <InfoRow label="Model ID" value={deployment.modelId} />
          <InfoRow label="Size" value={deployment.modelSize} />
          <InfoRow label="Docker Image" value={deployment.modelImage} />
          <InfoRow label="Min VRAM" value={`${deployment.modelMinVram} GB`} />
        </div>
      </div>

      <div>
        <SectionTitle>GPU</SectionTitle>
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
          <InfoRow label="GPU Type" value="NVIDIA L4" />
          <InfoRow label="OpenClaw Version" value="2026.3.9" />
        </div>
      </div>
    </div>
  );
}

function SkillsSection({ deployment }: { deployment: Deployment }) {
  const SKILL_LABELS: Record<string, string> = {
    solana_private_transaction: "Solana Private Transaction",
    brave_search: "Brave Search",
    file_system_access: "File System Access",
  };

  return (
    <div>
      <SectionTitle>Active Skills</SectionTitle>
      <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
        {deployment.skills.length === 0 ? (
          <p className="text-sm text-white/30 py-4">No skills configured.</p>
        ) : (
          deployment.skills.map((skill) => (
            <SwitchRow
              key={skill}
              label={SKILL_LABELS[skill] ?? skill}
              checked={true}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MemoryBehaviorSection({ deployment }: { deployment: Deployment }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Memory</SectionTitle>
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
          <SwitchRow
            label="Private Memory"
            description="Agent retains private conversation context"
            checked={deployment.memory.enablePrivateMemory}
          />
          <SwitchRow
            label="Persistent Memory"
            description="Memory persists across restarts"
            checked={deployment.memory.persistentMemory}
          />
          <SwitchRow
            label="Encryption"
            description="Encrypt memory at rest"
            checked={deployment.memory.encryption}
          />
        </div>
      </div>

      <div>
        <SectionTitle>Agent Behavior</SectionTitle>
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
          <SwitchRow
            label="Autonomous Mode"
            description="Agent can execute tasks without approval"
            checked={deployment.agentBehavior.autonomousMode}
          />
          <InfoRow
            label="Task Timeout"
            value={`${deployment.agentBehavior.taskTimeout}s`}
          />
          <InfoRow
            label="Max Concurrent Tasks"
            value={deployment.agentBehavior.maxConcurrentTasks}
          />
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ deployment }: { deployment: Deployment }) {
  return (
    <div>
      <SectionTitle>Notification Preferences</SectionTitle>
      <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
        <SwitchRow
          label="Webhook Notifications"
          description="Receive events via webhook"
          checked={deployment.notifications.webhookNotifications}
        />
        <SwitchRow
          label="Email Alerts"
          description="Get email alerts for critical events"
          checked={deployment.notifications.emailAlerts}
        />
        <SwitchRow
          label="Task Reports"
          description="Receive periodic task summary reports"
          checked={deployment.notifications.taskReports}
        />
      </div>
    </div>
  );
}

function AutoSleepSection({ deployment }: { deployment: Deployment }) {
  return (
    <div>
      <SectionTitle>Auto Sleep</SectionTitle>
      <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-5">
        <SwitchRow
          label="Enable Auto Sleep"
          description="Automatically sleep agent after idle period"
          checked={deployment.autoSleep.enableAutoSleep}
        />
        <InfoRow
          label="Idle Timeout"
          value={`${deployment.autoSleep.idleTimeout} min`}
        />
      </div>
    </div>
  );
}

/* ─── Main Modal ───────────────────────────────────────────────────────────── */

interface AgentSettingsModalProps {
  deployment: Deployment;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onUpdated?: (d: Deployment) => void;
}

export function AgentSettingsModal({
  deployment,
  onClose,
  onDelete,
  onUpdated,
}: AgentSettingsModalProps) {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ESC to close */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /* Render active section */
  function renderSection() {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSection
            deployment={deployment}
            onDeleteClick={() => setConfirmDelete(true)}
            onUpdated={onUpdated}
          />
        );
      case "model":
        return <ModelGpuSection deployment={deployment} />;
      case "skills":
        return <SkillsSection deployment={deployment} />;
      case "memory":
        return <MemoryBehaviorSection deployment={deployment} />;
      case "notifications":
        return <NotificationsSection deployment={deployment} />;
      case "autosleep":
        return <AutoSleepSection deployment={deployment} />;
    }
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-[900px] h-[600px] rounded-3xl overflow-hidden pointer-events-auto border border-white/10 backdrop-blur-2xl flex"
          style={{
            background:
              "linear-gradient(180deg, rgba(21,21,21,0.92) 0%, rgba(28,28,28,0.88) 100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top edge highlight */}
          <div
            className="absolute inset-x-0 top-0 h-px opacity-60"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,235,248,0.25) 30%, rgba(255,235,248,0.5) 50%, rgba(255,235,248,0.25) 70%, transparent 95%)",
            }}
            aria-hidden
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 border border-white/8 transition-colors cursor-pointer text-white/50 hover:text-white/90"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <nav className="w-[260px] shrink-0 border-r border-white/6 pt-8 pb-6 px-5 flex flex-col">
            <h2 className="text-lg font-semibold text-white/90 px-3 mb-6">
              Settings
            </h2>
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => setActiveSection(item.key)}
                    className={[
                      "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] transition-colors cursor-pointer",
                      activeSection === item.key
                        ? "bg-white/8 text-white"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <span className="shrink-0 opacity-60">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Content ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto py-6 px-8">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete Agent"
        message="This will permanently delete the agent and all associated infrastructure (pod, tunnel, DNS). This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Agent"}
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true);
          await onDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>,
    document.body,
  );
}
