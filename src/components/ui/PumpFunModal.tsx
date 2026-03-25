"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import PumpFunLogo from "@/components/icons/PumpFunLogo";

interface PumpFunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PUMPFUN_URL =
  "https://pump.fun/coin/GtAHbD7JD7xQJW9ai1fxdKG65cKsbuCTukTNjRkpump";

export function PumpFunModal({ isOpen, onClose }: PumpFunModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-5 rounded-3xl bg-black/70 border border-white/10 backdrop-blur-2xl px-8 py-8 max-w-xs w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <PumpFunLogo className="w-14 h-14 text-white/80" />

        <h2 className="text-lg font-semibold text-white/90 text-center tracking-tight">
          Support This Project
        </h2>

        <p className="text-sm text-white/50 text-center leading-relaxed">
          Help us keep building MoltGhost by supporting the project on PumpFun.
          Every bit counts! 🤍
        </p>

        <a
          href={PUMPFUN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white/10 border border-white/15 px-5 py-3.5 transition-all hover:bg-white/20 hover:border-white/25 group"
        >
          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            Open on PumpFun
          </span>
          <svg
            className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </a>
      </div>
    </div>,
    document.body,
  );
}
