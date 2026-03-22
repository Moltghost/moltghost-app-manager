"use client";
import { Button } from "@/components/ui/Button";
import MoltghostIcon from "@/components/icons/MoltghostIcon";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-8 sm:px-10 sm:py-10 gap-5">
      <h1 className="text-2xl font-semibold text-white/88 tracking-tight">
        Hello, Welcome!
      </h1>

      <MoltghostIcon width={90} height={90} className="text-white/70" />

      <p className="text-sm text-white/42 max-w-xs leading-relaxed">
        Let&apos;s start spawning your AI agent.
      </p>

      <Button
        variant="glass"
        size="md"
        onClick={onNext}
        className="rounded-full px-8 mt-1"
      >
        Deploy Agent
      </Button>
    </div>
  );
}
