"use client";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-5 rounded-3xl bg-black/70 border border-white/10 backdrop-blur-2xl px-10 py-10 max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
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
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold text-white">
            Something went wrong
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">{message}</p>
        </div>

        <Button
          variant="glass"
          size="md"
          onClick={onClose}
          className="rounded-full px-8 mt-1 w-full"
        >
          Dismiss
        </Button>
      </div>
    </div>,
    document.body,
  );
}
