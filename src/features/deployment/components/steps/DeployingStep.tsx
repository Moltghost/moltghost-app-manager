"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import CoffeeIcon from "@/components/icons/CoffeeIcon";
import { ConsoleLogsModal } from "../ConsoleLogsModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  getDeployment,
  getDeploymentLogs,
  deleteDeployment,
} from "@/features/deployment/services/deploymentService";
import type { Deployment } from "@/features/deployment/types";

interface DeployingStepProps {
  deploymentId: string;
  onDone?: (deployment: Deployment) => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function DeployingStep({
  deploymentId,
  onDone,
  onCancel,
  onRetry,
}: DeployingStepProps) {
  const [status, setStatus] = useState<Deployment["status"]>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { getAccessToken } = usePrivy();

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    setConfirmOpen(false);
    try {
      const authToken = await getAccessToken();
      if (authToken) {
        await deleteDeployment(deploymentId, authToken);
      }
      onCancel?.();
    } catch (err) {
      console.error("Failed to cancel deployment:", err);
      setCancelling(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const authToken = await getAccessToken();
        if (!authToken) return;

        // Store token for logs modal
        if (!token) setToken(authToken);

        const deployment = await getDeployment(deploymentId, authToken);
        if (!active) return;
        setStatus(deployment.status);

        if (deployment.status === "running" || deployment.status === "failed") {
          if (deployment.status === "failed") {
            try {
              const logs = await getDeploymentLogs(deploymentId, authToken);
              const errLog = logs.reverse().find((l) => l.level === "error");
              if (errLog) setErrorMessage(errLog.message);
            } catch {}
            // Don't auto-navigate on failure — let user choose retry/cancel
          } else {
            // Agent is live — reset immediately
            onDone?.(deployment);
          }
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
  }, [deploymentId, onDone, getAccessToken, token]);

  const isTerminal = status === "running" || status === "failed";

  return (
    <div className="flex items-center justify-center w-full p-6">
      <div className="rounded-3xl p-6 sm:p-8 max-w-2xl w-full">
        <div className="flex flex-col items-center text-center">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {status === "running"
              ? "Agent is Live"
              : status === "failed"
                ? "Deployment Failed"
                : "Deploying Your Agent"}
          </h2>

          {/* Sub-message */}
          <p className="text-sm text-white/70 max-w-sm leading-relaxed mt-3 mb-8">
            {status === "failed"
              ? "Something went wrong during deployment."
              : "MoltGhost is provisioning the machine, installing the local LLM, and configuring the agent runtime. This may take a few minutes."}
          </p>

          {/* Error detail */}
          {status === "failed" && errorMessage && (
            <div className="w-full rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6">
              <p className="text-xs text-red-400 font-mono break-all">
                {errorMessage}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 text-[11px] text-red-300 hover:text-white transition-colors cursor-pointer font-medium underline underline-offset-2"
                >
                  Retry Deployment
                </button>
              )}
            </div>
          )}

          {/* Icon */}
          <div className="relative flex items-center justify-center py-4 mb-4">
            <CoffeeIcon
              width={80}
              height={104}
              className={[
                "transition-opacity duration-300 text-white",
                isTerminal ? "opacity-100" : "opacity-100 animate-pulse",
              ].join(" ")}
            />
          </div>

          {/* Polling hint */}
          {!isTerminal && (
            <div className="space-y-1 w-full mb-10">
              <p className="text-sm text-white">
                Please wait and enjoy your coffee
              </p>
              <p className="text-xs text-white/60">
                Estimated setup time: 5-10 minutes
              </p>
            </div>
          )}

          <div className="mb-8 flex flex-col items-center">
            {!isTerminal && (
              <p className="text-xs text-white animate-pulse">
                Pod is starting up — waiting for container to initialize... 30s
              </p>
            )}
            <button
              onClick={() => setLogsOpen(true)}
              className="text-xs text-green-500 hover:text-green-300 transition-colors cursor-pointer font-medium mt-3"
            >
              Console Log
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={cancelling}
              className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer font-medium mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelling..." : "Cancel Deployment"}
            </button>
          </div>

          {/* Step indicator */}
          <p className="text-sm text-white/50 tracking-wide">5 / 5</p>
        </div>
      </div>

      {/* Console Logs Modal */}
      <ConsoleLogsModal
        isOpen={logsOpen}
        deploymentId={deploymentId}
        token={token}
        onClose={() => setLogsOpen(false)}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Cancel Deployment?"
        message="This will stop and destroy the pod on RunPod and remove the Cloudflare tunnel. This action cannot be undone."
        confirmLabel="Yes, Cancel & Destroy"
        cancelLabel="Keep Running"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
