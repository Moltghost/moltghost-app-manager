"use client";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export type DeploymentMode = "dedicated" | "shared" | "external";

interface DeploymentModeStepProps {
  onNext: (mode: DeploymentMode) => void;
}

const MODES: {
  id: DeploymentMode;
  title: string;
  description: string;
  badge: string;
  features: string[];
  stars: number;
}[] = [
  {
    id: "dedicated",
    title: "Dedicated Local\nModels",
    description:
      "Run OpenClaw with a local model fully inside your isolated agent environment.",
    badge: "Most Private",
    features: [
      "No external model APIs",
      "Dedicated GPU inference",
      "Fully isolated agent runtime",
      "Best for sensitive workflows",
      "GPU required",
    ],
    stars: 5,
  },
  {
    id: "shared",
    title: "Shared Local\nModels",
    description:
      "Run your agent in a private environment while using shared local models hosted by MoltGhost.",
    badge: "Best Value",
    features: [
      "Shared GPU inference",
      "No external model APIs",
      "Lower cost than dedicated GPU",
      "Private runtime and storage",
      "Optimized for everyday agents",
    ],
    stars: 4,
  },
  {
    id: "external",
    title: "External Models",
    description:
      "Run OpenClaw in a private agent environment while connecting to your external model provider.",
    badge: "Most Flexible",
    features: [
      "Bring your own API key",
      "Works with OpenAI, Anthropic, etc",
      "Private memory and storage",
      "Lower hourly cost",
      "CPU-friendly deployment",
    ],
    stars: 3,
  },
];

const DISABLED_MODES: DeploymentMode[] = ["shared", "external"];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-base">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? "text-white/80" : "text-white/20"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function DeploymentModeStep({ onNext }: DeploymentModeStepProps) {
  return (
    <div className="flex flex-col items-center gap-8 px-8 py-10">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Choose How to Run Your Agent
        </h2>
        <p className="text-sm text-white/40">
          Select a deployment mode before choosing an agent template.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {MODES.map((mode) => {
          const disabled = DISABLED_MODES.includes(mode.id);
          return (
            <GlassCard
              key={mode.id}
              className={[
                "rounded-3xl! flex flex-col p-6 gap-8",
                disabled
                  ? "opacity-50 grayscale pointer-events-none select-none"
                  : "",
              ].join(" ")}
            >
              {/* Title + Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-white/90 leading-snug whitespace-pre-line">
                  {mode.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              {/* Badge */}
              <div className="relative w-full h-12.5 my-4">
                <span className="absolute top-0 bottom-0 my-auto left-0 right-0 w-full h-px bg-white/50"></span>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full! h-8! px-5! text-xs! self-start absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  onClick={() => onNext(mode.id)}
                >
                  {mode.badge}
                </Button>
              </div>

              {/* Feature List */}
              <ul className="flex flex-col gap-2 flex-1">
                {mode.features.map((f) => (
                  <li key={f} className="text-xs text-white/55 text-center">
                    {f}
                  </li>
                ))}
              </ul>

              {/* Footer: stars + arrow */}
              <div className="flex items-center justify-between mt-8">
                <StarRating count={mode.stars} />
                <button
                  onClick={() => onNext(mode.id)}
                  className={[
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    "text-(--c-content) text-base",
                    "bg-[rgba(233,223,200,0.10)]",
                    "backdrop-blur-[2px] brightness-[1.08] contrast-[1.04]",
                    "[box-shadow:inset_1px_1px_0_rgba(233,223,200,0.80),inset_0_2px_6px_rgba(0,0,0,0.20),0_0_0_1px_rgba(233,223,200,0.18)]",
                    "hover:bg-[rgba(233,223,200,0.16)]",
                    "transition-all duration-150 active:scale-95",
                  ].join(" ")}
                >
                  →
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide">1 / 5</p>
    </div>
  );
}
