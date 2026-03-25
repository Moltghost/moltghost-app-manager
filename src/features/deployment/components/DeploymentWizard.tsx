"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { WelcomeStep } from "./steps/WelcomeStep";
import { SelectProviderStep } from "./steps/SelectProviderStep";
import { DeploymentModeStep } from "./steps/DeploymentModeStep";
import { SelectModelStep } from "./steps/SelectModelStep";
import { ConfigureSettingsStep } from "./steps/ConfigureSettingsStep";
import { ReviewDeploymentStep } from "./steps/ReviewDeploymentStep";
import { DeployingStep } from "./steps/DeployingStep";
import { getDeployments } from "@/features/deployment/services/deploymentService";
import { ErrorDialog } from "@/components/ui/ErrorDialog";
import type {
  DeploymentMode,
  ModelOption,
  AgentSettings,
  Deployment,
  GpuType,
} from "@/features/deployment/types";
import { DEFAULT_AGENT_SETTINGS } from "@/features/deployment/types";

type Step =
  | "welcome"
  | "provider"
  | "mode"
  | "model"
  | "settings"
  | "review"
  | "deploying";

const WIDE_STEPS: Step[] = ["mode", "model", "settings"];
const BACK_MAP: Partial<Record<Step, Step>> = {
  provider: "welcome",
  mode: "provider",
  model: "mode",
  settings: "model",
  review: "settings",
};

const ACTIVE_STATUSES: Deployment["status"][] = [
  "pending",
  "provisioning",
  "starting",
];

function BackArrow({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-6 left-6 flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-white/90 hover:bg-white/10 transition-all"
      aria-label="Go back"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 8L2 12L6 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12H22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

interface DeploymentWizardProps {
  onAgentLive?: (deployment: Deployment) => void;
}

export function DeploymentWizard({ onAgentLive }: DeploymentWizardProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [runpodApiKey, setRunpodApiKey] = useState("");
  const [mode, setMode] = useState<DeploymentMode | null>(null);
  const [model, setModel] = useState<ModelOption | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<GpuType | null>(null);
  const [settings, setSettings] = useState<AgentSettings>(
    DEFAULT_AGENT_SETTINGS,
  );
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  // On mount: check if user already has an active deployment
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const list = await getDeployments(token);
        const active = list.find((d) => ACTIVE_STATUSES.includes(d.status));
        if (active) {
          setDeployment(active);
          setStep("deploying");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load deployments",
        );
      } finally {
        setChecking(false);
      }
    })();
  }, [getAccessToken]);

  if (checking) {
    return (
      <GlassCard className="w-full max-w-2xl">
        <div className="flex items-center justify-center py-24">
          <span className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
      <GlassCard
        className={
          WIDE_STEPS.includes(step) ? "w-full max-w-4xl" : "w-full max-w-2xl"
        }
      >
        <div className="relative">
          {BACK_MAP[step] && (
            <BackArrow onClick={() => setStep(BACK_MAP[step]!)} />
          )}

          {step === "welcome" && (
            <WelcomeStep onNext={() => setStep("provider")} />
          )}

          {step === "provider" && (
            <SelectProviderStep
              onNext={(key) => {
                setRunpodApiKey(key);
                setStep("mode");
              }}
            />
          )}

          {step === "mode" && (
            <DeploymentModeStep
              onNext={(selected) => {
                setMode(selected);
                setStep("model");
              }}
            />
          )}

          {step === "model" && (
            <SelectModelStep
              onNext={(selected, gpu) => {
                setModel(selected);
                setSelectedGpu(gpu);
                setStep("settings");
              }}
            />
          )}

          {step === "settings" && (
            <ConfigureSettingsStep
              onNext={(selected) => {
                setSettings(selected);
                setStep("review");
              }}
            />
          )}

          {step === "review" && mode && model && (
            <ReviewDeploymentStep
              mode={mode}
              model={model}
              settings={settings}
              runpodApiKey={runpodApiKey}
              gpuType={selectedGpu?.id}
              onLaunched={(created) => {
                setDeployment(created);
                setStep("deploying");
              }}
            />
          )}

          {step === "deploying" && deployment && (
            <DeployingStep
              deploymentId={deployment.id}
              onDone={(d) => {
                setDeployment(null);
                setStep("welcome");
                onAgentLive?.(d);
              }}
              onCancel={() => {
                setDeployment(null);
                setStep("welcome");
              }}
              onRetry={() => {
                setDeployment(null);
                setStep("review");
              }}
            />
          )}
        </div>
      </GlassCard>
    </>
  );
}
