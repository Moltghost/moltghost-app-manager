"use client";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-black font-semibold hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.12)]",
  secondary:
    "bg-white/8 text-white/80 border border-white/10 hover:bg-white/14 hover:border-white/18",
  ghost: "text-white/50 hover:text-white/80 hover:bg-white/6",
  danger:
    "bg-red-500/12 text-red-400 border border-red-500/22 hover:bg-red-500/22",
  glass: [
    "text-[var(--c-content)] !rounded-full !h-14 !px-10 text-base font-medium font-[family-name:var(--font-circular-std)]",
    "bg-[rgba(233,223,200,0.10)]",
    "backdrop-blur-[2px] brightness-[1.08] contrast-[1.04]",
    "[box-shadow:inset_1px_1px_0_rgba(233,223,200,0.80),inset_0_2px_6px_rgba(0,0,0,0.20),0_0_0_1px_rgba(233,223,200,0.18)]",
    "hover:bg-[rgba(233,223,200,0.16)]",
  ].join(" "),
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-8 text-base rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center whitespace-nowrap",
        "transition-all duration-150 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        "disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
