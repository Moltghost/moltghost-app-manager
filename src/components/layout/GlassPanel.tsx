"use client";

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  width?: "sm" | "md" | "lg" | "xl";
}

const widths: Record<NonNullable<GlassPanelProps["width"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function GlassPanel({
  children,
  className = "",
  width = "lg",
}: GlassPanelProps) {
  return (
    <div
      className={[
        "w-full relative rounded-3xl overflow-hidden",
        "border border-white/9",
        "bg-[rgba(10,7,16,0.80)] backdrop-blur-2xl",
        "shadow-[0_24px_80px_rgba(0,0,0,0.60),0_0_0_1px_rgba(255,255,255,0.04)_inset]",
        widths[width],
        className,
      ].join(" ")}
    >
      {/* Inner top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(255,235,248,0.25) 30%, rgba(255,235,248,0.45) 50%, rgba(255,235,248,0.25) 70%, transparent 95%)",
        }}
        aria-hidden
      />

      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 30% at 50% 0%, rgba(212,160,191,0.06) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative">{children}</div>
    </div>
  );
}
