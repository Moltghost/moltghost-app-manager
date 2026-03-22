import React from "react";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Fired when the card is clicked. Makes the card interactive (hover effect). */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  as?: React.ElementType;
}

export function GlassCard({
  children,
  className = "",
  onClick,
  as: Tag = "div",
}: GlassCardProps) {
  const interactive = !!onClick;

  return (
    <Tag
      onClick={onClick}
      style={{
        background:
          "linear-gradient(180deg, rgba(21,21,21,0.25) 0%, rgba(38,38,38,0.25) 100%)",
      }}
      className={[
        "relative rounded-[48px] overflow-hidden",
        // "border border-white/10",
        "backdrop-blur-2xl",
        interactive &&
          "cursor-pointer transition-opacity duration-200 hover:opacity-90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Top edge highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-80"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(255,235,248,0.35) 30%, rgba(255,235,248,0.65) 50%, rgba(255,235,248,0.35) 70%, transparent 95%)",
        }}
        aria-hidden
      />

      {/* Inner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(212,160,191,0.14) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div className="relative">{children}</div>
    </Tag>
  );
}
