"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import MoltghostIcon from "@/components/icons/MoltghostIcon";
import { getDeployment } from "@/features/deployment/services/deploymentService";
import type { Deployment } from "@/features/deployment/types";

interface DeployingStepProps {
  deploymentId: string;
  onDone?: (deployment: Deployment) => void;
}

const STATUS_LABEL: Record<Deployment["status"], string> = {
  pending: "Queued. Waiting for orchestration to start…",
  provisioning:
    "Setting up Cloudflare Tunnel and allocating GPU resources. This may take a moment.",
  starting:
    "Pod is up. Installing the local LLM and configuring the agent runtime. This may take a few minutes.",
  running: "Your agent is live and ready to use.",
  stopped: "Your agent has been stopped.",
  failed: "Deployment failed. Please try again.",
};

export function DeployingStep({ deploymentId, onDone }: DeployingStepProps) {
  const [status, setStatus] = useState<Deployment["status"]>("pending");
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const deployment = await getDeployment(deploymentId, token);
        if (!active) return;
        setStatus(deployment.status);

        if (deployment.status === "running" || deployment.status === "failed") {
          onDone?.(deployment);
          return; // stop polling
        }
      } catch {
        // silently retry
      }
      if (active) {
        setTimeout(poll, 4000);
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [deploymentId, onDone, getAccessToken]);

  const isTerminal = status === "running" || status === "failed";

  return (
    <div className="flex flex-col items-center text-center px-6 py-10 sm:px-10 sm:py-12 gap-6">
      {/* Icon */}
      <div className="relative flex items-center justify-center">
        <MoltghostIcon
          width={80}
          height={80}
          className={[
            "transition-opacity duration-500",
            isTerminal ? "opacity-70" : "opacity-40 animate-pulse",
          ].join(" ")}
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-white tracking-tight">
        {status === "running"
          ? "Agent is Live"
          : status === "failed"
            ? "Deployment Failed"
            : "Deploying Your Agent"}
      </h2>

      {/* Sub-message */}
      <p className="text-sm text-white/40 max-w-xs leading-relaxed">
        {STATUS_LABEL[status]}
      </p>

      {/* Polling hint */}
      {!isTerminal && (
        <p className="text-xs text-white/20 mt-2 animate-pulse">
          Please wait and enjoy your coffee.
          <br />
          Estimated time — applying environment variables…
        </p>
      )}

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide mt-4">5 / 5</p>
    </div>
  );
}
