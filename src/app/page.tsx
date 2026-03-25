"use client";
import { useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { FullScreenScene } from "@/components/layout/FullScreenScene";
import NavGlass from "@/components/layout/NavGlass";
import { UserPanel } from "@/components/layout/UserPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { DeploymentWizard } from "@/features/deployment/components/DeploymentWizard";
import { AgentsPanel } from "@/features/agents/components/AgentsPanel";

import type { Deployment } from "@/features/deployment/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState("1");
  const [pendingAgent, setPendingAgent] = useState<Deployment | null>(null);

  function handleAgentLive(deployment: Deployment) {
    setPendingAgent(deployment);
    setActiveTab("2");
  }

  return (
    <AuthGate>
      <FullScreenScene>
        <NavGlass selected={activeTab} onTabChange={setActiveTab} />
        <div className="relative z-20 w-full min-h-screen flex flex-col items-center justify-start pt-38 pb-12 sm:py-38 px-4 sm:px-0">
          {activeTab === "3" ? (
            <GlassCard className="rounded-3xl! overflow-hidden">
              <UserPanel />
            </GlassCard>
          ) : activeTab === "1" ? (
            <DeploymentWizard onAgentLive={handleAgentLive} />
          ) : activeTab === "2" ? (
            <AgentsPanel
              onNavigate={setActiveTab}
              initialAgent={pendingAgent}
              onInitialAgentConsumed={() => setPendingAgent(null)}
            />
          ) : null}
        </div>
      </FullScreenScene>
    </AuthGate>
  );
}
