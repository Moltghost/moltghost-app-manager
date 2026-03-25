"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { ErrorDialog } from "@/components/ui/ErrorDialog";
import {
  fetchModels,
  fetchGpuTypes,
} from "@/features/deployment/services/deploymentService";
import type { GpuType, ModelOption } from "@/features/deployment/types";

interface SelectModelStepProps {
  onNext: (model: ModelOption, gpu: GpuType) => void;
}

const ARROW_BTN = [
  "w-9 h-9 rounded-full flex items-center justify-center",
  "text-(--c-content) text-base",
  "bg-[rgba(233,223,200,0.10)]",
  "backdrop-blur-[2px] brightness-[1.08] contrast-[1.04]",
  "[box-shadow:inset_1px_1px_0_rgba(233,223,200,0.80),inset_0_2px_6px_rgba(0,0,0,0.20),0_0_0_1px_rgba(233,223,200,0.18)]",
  "hover:bg-[rgba(233,223,200,0.16)]",
  "transition-all duration-150 active:scale-95",
].join(" ");

// GPU IDs we want to show (first is default)
const SHOWN_GPU_IDS = ["NVIDIA L4", "NVIDIA RTX A4500"];

const FALLBACK_GPUS: GpuType[] = [
  {
    id: "NVIDIA L4",
    displayName: "NVIDIA L4",
    memoryInGb: 24,
    securePrice: null,
    communityPrice: null,
  },
  {
    id: "NVIDIA RTX A4500",
    displayName: "NVIDIA RTX A4500",
    memoryInGb: 20,
    securePrice: null,
    communityPrice: null,
  },
];

function priceLabel(gpu: GpuType): string {
  const price = gpu.securePrice ?? gpu.communityPrice;
  if (price == null) return "—";
  return `$${price.toFixed(3)}/hr`;
}

function gpuBadge(gpu: GpuType): string {
  if (gpu.displayName.includes("A4500")) return "A4500";
  if (gpu.displayName.includes("L4")) return "L4";
  return gpu.id.split(" ").pop() || gpu.id;
}

export function SelectModelStep({ onNext }: SelectModelStepProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [gpus, setGpus] = useState<GpuType[]>(FALLBACK_GPUS);
  const [selectedGpuId, setSelectedGpuId] = useState(SHOWN_GPU_IDS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        const [fetchedModels, gpuTypes] = await Promise.all([
          fetchModels(),
          token ? fetchGpuTypes(token).catch(() => []) : Promise.resolve([]),
        ]);
        setModels(fetchedModels);

        const available = SHOWN_GPU_IDS.map((id) =>
          (gpuTypes as GpuType[]).find((g) => g.id === id),
        ).filter(Boolean) as GpuType[];
        if (available.length > 0) setGpus(available);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load models");
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessToken]);

  const selectedGpu = gpus.find((g) => g.id === selectedGpuId) || gpus[0];

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 px-4 py-8 sm:px-8 sm:py-10">
      {/* Header */}
      <div className="text-center flex flex-col gap-2 pt-8 sm:pt-0">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Deploy Your AI Agent
        </h2>
        <p className="text-sm text-white/40">
          Select a model and infrastructure to launch your private AI agent
          using a local LLM
        </p>
      </div>

      {/* GPU selector pills */}
      <div className="flex items-center gap-2">
        {gpus.map((gpu) => (
          <button
            key={gpu.id}
            onClick={() => setSelectedGpuId(gpu.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selectedGpuId === gpu.id
                ? "bg-white/15 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            {gpuBadge(gpu)} — {gpu.memoryInGb} GB
          </button>
        ))}
      </div>

      {/* Model grid */}
      {loading ? (
        <p className="text-sm text-white/30 animate-pulse">Loading models…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {models.map((model) => (
            <GlassCard
              key={model.id}
              className="rounded-3xl! flex flex-col gap-4 p-6"
            >
              {/* Label + recommended badge */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white leading-snug">
                  {model.label}
                </h3>
                {model.recommended && (
                  <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/15">
                    Recommended
                  </span>
                )}
              </div>

              {/* Desc + size */}
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-xs text-white/55">{model.desc}</p>
                <p className="text-xs text-white/35">{model.size}</p>
              </div>

              {/* GPU block */}
              <div className="flex flex-col gap-2.5 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-white/80 tracking-wider">
                    {gpuBadge(selectedGpu)}
                  </span>
                  <span className="text-xs font-medium text-white/70">
                    {selectedGpu.displayName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {selectedGpu.memoryInGb} GB VRAM
                  </span>
                  <span className="text-xs font-semibold text-white/70 tabular-nums">
                    {priceLabel(selectedGpu)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-end pt-2">
                <button
                  className={ARROW_BTN}
                  onClick={() => onNext(model, selectedGpu)}
                >
                  →
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide">3 / 6</p>

      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
    </div>
  );
}
