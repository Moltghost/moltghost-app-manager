"use client";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface LinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const LINKS: { label: string; url: string; icon: ReactNode }[] = [
  {
    label: "Website",
    url: "https://moltghost.io",
    icon: "🌐",
  },
  {
    label: "Twitter / X",
    url: "https://x.com/maboroshimolt",
    icon: "𝕏",
  },
  {
    label: "Telegram",
    url: "https://t.me/moltghost",
    icon: <TelegramIcon />,
  },
  {
    label: "Documentation",
    url: "https://docs.moltghost.io",
    icon: "📄",
  },
];

export function LinksModal({ isOpen, onClose }: LinksModalProps) {
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
        className="flex flex-col gap-3 rounded-3xl bg-black/70 border border-white/10 backdrop-blur-2xl px-8 py-8 max-w-xs w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white/80 text-center tracking-tight mb-1">
          Useful Links
        </h2>

        <div className="flex flex-col gap-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/8 px-5 py-3.5 transition-all hover:bg-white/10 hover:border-white/15 group"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
                {link.label}
              </span>
              <svg
                className="w-3.5 h-3.5 ml-auto text-white/25 group-hover:text-white/50 transition-colors"
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
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
