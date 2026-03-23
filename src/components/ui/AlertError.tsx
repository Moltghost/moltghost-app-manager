import React from "react";

interface AlertErrorProps {
  title: string;
  message: string;
}

export function AlertError({ title, message }: AlertErrorProps) {
  return (
    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
      <p className="text-red-400 text-sm font-medium">{title}</p>
      <p className="text-red-300/80 text-xs mt-1">{message}</p>
    </div>
  );
}
