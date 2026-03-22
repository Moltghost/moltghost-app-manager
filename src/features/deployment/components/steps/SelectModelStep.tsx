"use client";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchModels } from "@/features/deployment/services/deploymentService";
import type { ModelOption } from "@/features/deployment/types";

interface GpuType {
  id: string;
  displayName: string;
  memoryInGb: number;
  securePrice: number | null;
  communityPrice: number | null;
}

interface SelectModelStepProps {
  onNext: (model: ModelOption) => void;
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

// Fallback GPU info shown when API is unavailable
const FALLBACK_GPU: GpuType = {
  id: "NVIDIA L4",
  displayName: "NVIDIA L4",
  memoryInGb: 24,
  securePrice: null,
  communityPrice: null,
};

function priceLabel(gpu: GpuType): string {
  const price = gpu.securePrice ?? gpu.communityPrice;
  if (price == null) return "—";
  return `$${price.toFixed(3)}/hr`;
}

export function SelectModelStep({ onNext }: SelectModelStepProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [gpu, setGpu] = useState<GpuType>(FALLBACK_GPU);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchModels(),
      fetch("/api/runpod/gpu-types")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([fetchedModels, gpuTypes]) => {
        setModels(fetchedModels);
        const l4 = (gpuTypes as GpuType[]).find((g) => g.id === "NVIDIA L4");
        if (l4) setGpu(l4);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 px-8 py-10">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Deploy Your AI Agent
        </h2>
        <p className="text-sm text-white/40">
          Select a model and infrastructure to launch your private AI agent
          using a local LLM
        </p>
      </div>

      {/* Model grid */}
      {loading ? (
        <p className="text-sm text-white/30 animate-pulse">Loading models…</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 w-full">
          {models.map((model) => (
            <GlassCard
              key={model.id}
              className="rounded-3xl! flex flex-col gap-5 p-6"
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
                    L4
                  </span>
                  <span className="text-xs font-medium text-white/70">
                    {gpu.displayName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {gpu.memoryInGb} GB VRAM
                  </span>
                  <span className="text-xs font-semibold text-white/70 tabular-nums">
                    {priceLabel(gpu)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-end pt-2">
                <button className={ARROW_BTN} onClick={() => onNext(model)}>
                  →
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide">2 / 5</p>
    </div>
  );
}
