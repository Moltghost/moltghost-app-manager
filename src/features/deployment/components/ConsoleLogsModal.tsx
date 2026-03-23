"use client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface LogEntry {
  id?: string;
  message: string;
  level: string;
  createdAt?: string;
}

interface ConsoleLogsModalProps {
  isOpen: boolean;
  deploymentId: string;
  token: string;
  onClose: () => void;
}

export function ConsoleLogsModal({
  isOpen,
  deploymentId,
  token,
  onClose,
}: ConsoleLogsModalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    setLoading(true);

    // Poll logs every 2 seconds
    const fetchLogs = async () => {
      try {
        const res = await fetch(
          `/api/deployments/${deploymentId}/logs?t=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setLogs(Array.isArray(data) ? data : data.logs || []);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);

    // Handle ESC key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, deploymentId, token, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black sticky top-0">
          <h3 className="text-lg font-semibold text-white">Console Logs</h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Logs content */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6 font-mono text-xs"
        >
          {loading && logs.length === 0 ? (
            <p className="text-white/40">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-white/40">No logs yet</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, idx) => (
                <div key={`${idx}-${log.createdAt}`} className="text-white/70">
                  <span className="text-white/40">[{idx}]</span>{" "}
                  <span
                    className={
                      log.level === "error"
                        ? "text-red-400"
                        : log.level === "warn"
                          ? "text-yellow-400"
                          : log.level === "info"
                            ? "text-blue-400"
                            : "text-white/70"
                    }
                  >
                    [{log.level}]
                  </span>{" "}
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3 flex justify-end bg-black sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors"
          >
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
