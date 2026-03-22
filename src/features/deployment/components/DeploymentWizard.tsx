"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WelcomeStep } from "./steps/WelcomeStep";
import { DeploymentModeStep } from "./steps/DeploymentModeStep";
import { SelectModelStep } from "./steps/SelectModelStep";
import { ConfigureSettingsStep } from "./steps/ConfigureSettingsStep";
import { ReviewDeploymentStep } from "./steps/ReviewDeploymentStep";
import { DeployingStep } from "./steps/DeployingStep";
import type {
  DeploymentMode,
  ModelOption,
  AgentSettings,
  Deployment,
} from "@/features/deployment/types";
import { DEFAULT_AGENT_SETTINGS } from "@/features/deployment/types";

type Step = "welcome" | "mode" | "model" | "settings" | "review" | "deploying";

const WIDE_STEPS: Step[] = ["mode", "model", "settings"];
const BACK_MAP: Partial<Record<Step, Step>> = {
  mode: "welcome",
  model: "mode",
  settings: "model",
  review: "settings",
};

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

export function DeploymentWizard() {
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<DeploymentMode | null>(null);
  const [model, setModel] = useState<ModelOption | null>(null);
  const [settings, setSettings] = useState<AgentSettings>(
    DEFAULT_AGENT_SETTINGS,
  );
  const [deployment, setDeployment] = useState<Deployment | null>(null);

  return (
    <GlassCard
      className={
        WIDE_STEPS.includes(step) ? "w-full max-w-4xl" : "w-full max-w-2xl"
      }
    >
      <div className="relative">
        {BACK_MAP[step] && (
          <BackArrow onClick={() => setStep(BACK_MAP[step]!)} />
        )}

        {step === "welcome" && <WelcomeStep onNext={() => setStep("mode")} />}

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
            onNext={(selected) => {
              setModel(selected);
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
            onLaunched={(created) => {
              setDeployment(created);
              setStep("deploying");
            }}
          />
        )}

        {step === "deploying" && deployment && (
          <DeployingStep deploymentId={deployment.id} />
        )}
      </div>
    </GlassCard>
  );
}
