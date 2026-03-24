"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { ErrorDialog } from "@/components/ui/ErrorDialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { createDeployment } from "@/features/deployment/services/deploymentService";
import { useEncryptionKey } from "@/hooks/useEncryptionKey";
import { encrypt } from "@/lib/crypto";
import type {
  AgentSettings,
  Deployment,
  DeploymentMode,
  ModelOption,
} from "@/features/deployment/types";

interface ReviewDeploymentStepProps {
  mode: DeploymentMode;
  model: ModelOption;
  settings: AgentSettings;
  onLaunched: (deployment: Deployment) => void;
}

const MODE_LABEL: Record<DeploymentMode, string> = {
  dedicated: "Dedicated Local Models",
  shared: "Shared Local Models",
  external: "External Models",
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className="text-xs text-white/75 text-right">{value}</span>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

export function ReviewDeploymentStep({
  mode,
  model,
  settings,
  onLaunched,
}: ReviewDeploymentStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { getAccessToken } = usePrivy();
  const { getKey } = useEncryptionKey();

  const isProduction = process.env.NODE_ENV === "production";

  async function handleLaunch() {
    if (isProduction) {
      setShowModal(true);
      return;
    }
    // dev: proceed with actual launch
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      // Zero-knowledge encrypt sensitive fields before sending to backend
      const key = await getKey();
      const encryptedSettings: AgentSettings = {
        ...settings,
        agentName: settings.agentName
          ? await encrypt(settings.agentName, key)
          : "",
        agentDescription: settings.agentDescription
          ? await encrypt(settings.agentDescription, key)
          : "",
      };

      const deployment = await createDeployment(
        {
          mode,
          model,
          settings: encryptedSettings,
          isEncrypted: true,
          encryptionVersion: "v1",
        },
        token,
      );
      onLaunched(deployment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setLoading(false);
    }
  }

  const enabledSkills = settings.skills.length
    ? settings.skills
        .map((s) =>
          s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        )
        .join(", ")
    : "None";

  return (
    <>
      <div className="flex flex-col items-center gap-6 sm:gap-8 px-4 py-8 sm:px-8 sm:py-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center flex flex-col gap-2 pt-8 sm:pt-0">
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Review Agent Deployment
          </h2>
          <p className="text-sm text-white/40">
            Please confirm your agent configuration before launching.
          </p>
        </div>

        {/* Summary card */}
        <GlassCard className="!rounded-2xl w-full p-5 flex flex-col gap-5">
          {/* Mode header */}
          <p className="text-sm font-semibold text-white/80 border-b border-white/10 pb-3">
            {MODE_LABEL[mode]}
          </p>

          <ReviewSection title="Agent Identity">
            <ReviewRow label="Name" value={settings.agentName} />
            <ReviewRow label="Description" value={settings.agentDescription} />
          </ReviewSection>

          <ReviewSection title="Runtime Template">
            <ReviewRow label="Template" value="OpenClaw 2026.1.0" />
            <ReviewRow label="Model" value={model.label} />
          </ReviewSection>

          <ReviewSection title="Infrastructure">
            <ReviewRow label="GPU" value="NVIDIA L4" />
            <ReviewRow label="Image" value={model.image} />
            <ReviewRow label="Min VRAM" value={`${model.minVram} GB`} />
            <ReviewRow label="Size" value={model.size} />
          </ReviewSection>

          <ReviewSection title="Skills">
            <ReviewRow label="Enabled" value={enabledSkills} />
          </ReviewSection>

          <ReviewSection title="Memory">
            <ReviewRow
              label="Private Memory"
              value={
                settings.memory.enablePrivateMemory ? "Enabled" : "Disabled"
              }
            />
            <ReviewRow
              label="Persistent"
              value={settings.memory.persistentMemory ? "Enabled" : "Disabled"}
            />
            <ReviewRow
              label="Encryption"
              value={settings.memory.encryption ? "Enabled" : "Disabled"}
            />
          </ReviewSection>

          <ReviewSection title="Agent Behavior">
            <ReviewRow
              label="Autonomous Mode"
              value={settings.agentBehavior.autonomousMode ? "On" : "Off"}
            />
            <ReviewRow
              label="Task Timeout"
              value={`${settings.agentBehavior.taskTimeout}s`}
            />
            <ReviewRow
              label="Max Concurrent Tasks"
              value={String(settings.agentBehavior.maxConcurrentTasks)}
            />
          </ReviewSection>

          <ReviewSection title="Notifications">
            <ReviewRow
              label="Webhook"
              value={settings.notifications.webhookNotifications ? "On" : "Off"}
            />
            <ReviewRow
              label="Email Alerts"
              value={settings.notifications.emailAlerts ? "On" : "Off"}
            />
            <ReviewRow
              label="Task Reports"
              value={settings.notifications.taskReports ? "On" : "Off"}
            />
          </ReviewSection>

          <ReviewSection title="Auto Sleep">
            <ReviewRow
              label="Auto Sleep"
              value={
                settings.autoSleep.enableAutoSleep ? "Enabled" : "Disabled"
              }
            />
            <ReviewRow
              label="Idle Timeout"
              value={`${settings.autoSleep.idleTimeout} min`}
            />
          </ReviewSection>
        </GlassCard>

        {error && (
          <ErrorDialog message={error} onClose={() => setError(null)} />
        )}

        <Button
          variant="glass"
          size="md"
          onClick={handleLaunch}
          disabled={loading}
          className="rounded-full px-10"
        >
          {loading ? "Launching…" : "Launch Agent"}
        </Button>

        {/* Step indicator */}
        <p className="text-sm text-white/30 tracking-wide">4 / 5</p>
      </div>

      {/* Coming Soon Modal — rendered via portal so backdrop covers full screen */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <div
              className="flex flex-col items-center gap-4 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl px-10 py-10 max-w-sm w-full mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white">Coming Soon</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Public agent deployment isn&apos;t available yet. We&apos;re in
                private testing.
              </p>
              <Button
                variant="glass"
                size="md"
                onClick={() => setShowModal(false)}
                className="rounded-full px-8 mt-2"
              >
                Got it
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
