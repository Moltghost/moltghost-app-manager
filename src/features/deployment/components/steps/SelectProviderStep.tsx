"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  validateRunpodApiKey,
  getUserProfile,
  saveRunpodApiKey,
} from "@/features/deployment/services/deploymentService";

interface SelectProviderStepProps {
  onNext: (runpodApiKey: string) => void;
}

export function SelectProviderStep({ onNext }: SelectProviderStepProps) {
  const [provider] = useState<string>("runpod");
  const [apiKey, setApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  // Load saved key status on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const profile = await getUserProfile(token);
        setHasSavedKey(!!profile.runpodApiKey);
      } catch {
        // ignore — user just needs to enter key manually
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessToken]);

  async function handleContinue() {
    // If using saved key, pass "saved" sentinel — backend will use stored key
    if (hasSavedKey && !apiKey.trim()) {
      onNext("__saved__");
      return;
    }

    setValidating(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await validateRunpodApiKey(apiKey.trim(), token);
      // Save to user profile for next time
      await saveRunpodApiKey(apiKey.trim(), token);
      onNext(apiKey.trim());
    } catch {
      setError("Invalid API key — please check and try again.");
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 px-4 py-8 sm:px-8 sm:py-10 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center flex flex-col gap-2 pt-8 sm:pt-0">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Select Compute Provider
        </h2>
        <p className="text-sm text-white/40">
          Choose a compute provider for your agent deployment.
        </p>
      </div>

      {/* Provider dropdown */}
      <div className="w-full flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
          Provider
        </p>
        <div className="relative">
          <select
            value={provider}
            disabled
            className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
          >
            <option value="runpod">RunPod</option>
            <option disabled>Other providers — Coming Soon</option>
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* API Key input */}
      {provider === "runpod" && !loading && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
            RunPod API Key
          </p>
          {hasSavedKey && !apiKey.trim() ? (
            <div className="flex items-center justify-between w-full text-sm text-white bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
              <span className="text-green-400/80">API key saved ✓</span>
              <button
                type="button"
                onClick={() => setHasSavedKey(false)}
                className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-white/55">
                Enter your RunPod API key to provision GPU compute for your
                agent.
              </p>
              <input
                type="password"
                placeholder="RunPod API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 placeholder:text-white/35 focus:outline-none focus:border-white/30 transition-colors"
                autoComplete="off"
              />
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {/* Continue button */}
      <Button
        variant="glass"
        size="md"
        onClick={handleContinue}
        disabled={(!apiKey.trim() && !hasSavedKey) || validating || loading}
        className="rounded-full px-10"
      >
        {validating ? "Validating…" : "Continue"}
      </Button>

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide">1 / 6</p>
    </div>
  );
}
