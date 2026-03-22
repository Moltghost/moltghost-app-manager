"use client";
import { useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { FullScreenScene } from "@/components/layout/FullScreenScene";
import NavGlass from "@/components/layout/NavGlass";
import { UserPanel } from "@/components/layout/UserPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { DeploymentWizard } from "@/features/deployment/components/DeploymentWizard";

const TAB_LABELS: Record<string, string> = {
  "2": "Claws",
  "3": "Wallet",
  "4": "Settings",
};

function ComingSoonCard({ label }: { label: string }) {
  return (
    <GlassCard className="rounded-3xl! overflow-hidden w-full max-w-sm">
      <div className="flex flex-col items-center justify-center gap-3 px-8 py-10 sm:px-16 sm:py-14">
        <p className="text-2xl font-semibold text-white/70 tracking-tight">
          Coming Soon
        </p>
        <p className="text-sm text-white/30">{label} is not available yet.</p>
      </div>
    </GlassCard>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <AuthGate>
      <FullScreenScene>
        <NavGlass selected={activeTab} onTabChange={setActiveTab} />
        <div className="relative z-20 w-full min-h-screen flex flex-col items-center justify-start pt-38 pb-12 sm:py-38 px-4 sm:px-0">
          {activeTab === "5" ? (
            <GlassCard className="rounded-3xl! overflow-hidden">
              <UserPanel />
            </GlassCard>
          ) : activeTab === "1" ? (
            <DeploymentWizard />
          ) : (
            <ComingSoonCard label={TAB_LABELS[activeTab] ?? "This page"} />
          )}
        </div>
      </FullScreenScene>
    </AuthGate>
  );
}
