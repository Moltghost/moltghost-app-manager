"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="flex flex-col items-center gap-5 rounded-3xl bg-black/70 border border-white/10 backdrop-blur-2xl px-10 py-10 max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className={[
            "w-12 h-12 rounded-full flex items-center justify-center",
            isDanger
              ? "bg-red-500/15 border border-red-500/30"
              : "bg-white/10 border border-white/20",
          ].join(" ")}
        >
          {isDanger ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="rgb(248 113 113)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/70"
              />
              <path
                d="M12 8v4M12 16h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-white/70"
              />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full mt-1">
          <Button
            variant={isDanger ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            loading={loading}
            className="w-full"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
            className="w-full"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
