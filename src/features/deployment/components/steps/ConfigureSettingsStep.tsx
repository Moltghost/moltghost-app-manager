"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  DEFAULT_AGENT_SETTINGS,
  type AgentSettings,
} from "@/features/deployment/types";

interface ConfigureSettingsStepProps {
  onNext: (settings: AgentSettings) => void;
}

function NumberInput({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
      className={[
        "w-16 text-right text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1",
        "border border-white/10 focus:outline-none focus:border-white/25",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      ].join(" ")}
    />
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <h3 className="text-sm font-semibold text-white/90">{title}</h3>
      <p className="text-xs text-white/40">{subtitle}</p>
    </div>
  );
}

function SettingCard({
  label,
  desc,
  right,
}: {
  label: string;
  desc: string;
  right: React.ReactNode;
}) {
  return (
    <GlassCard className="flex flex-col justify-between gap-3 !rounded-2xl px-4 py-4 min-h-[110px]">
      <div className="flex flex-col gap-1.5 flex-1">
        <span className="text-xs font-semibold text-white/80">{label}</span>
        <span className="text-[11px] text-white/40 leading-snug">{desc}</span>
      </div>
      <div className="flex justify-end">{right}</div>
    </GlassCard>
  );
}

const SKILL_OPTIONS = [
  {
    id: "solana_private_transaction",
    label: "Solana Private Transaction",
    desc: "Allow the agent to securely sign and send private transactions on the Solana network.",
  },
  {
    id: "brave_search",
    label: "Brave Search",
    desc: "Allow the agent to access real-time web search results using the Brave Search API.",
  },
  {
    id: "file_system_access",
    label: "File System Access",
    desc: "Allow the agent to read and write files within its the add runtime environment.",
  },
];

export function ConfigureSettingsStep({ onNext }: ConfigureSettingsStepProps) {
  const [settings, setSettings] = useState<AgentSettings>(
    DEFAULT_AGENT_SETTINGS,
  );

  function toggleSkill(id: string) {
    setSettings((prev) => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter((s) => s !== id)
        : [...prev.skills, id],
    }));
  }

  function setMemory<K extends keyof AgentSettings["memory"]>(
    key: K,
    value: AgentSettings["memory"][K],
  ) {
    setSettings((prev) => ({
      ...prev,
      memory: { ...prev.memory, [key]: value },
    }));
  }

  function setBehavior<K extends keyof AgentSettings["agentBehavior"]>(
    key: K,
    value: AgentSettings["agentBehavior"][K],
  ) {
    setSettings((prev) => ({
      ...prev,
      agentBehavior: { ...prev.agentBehavior, [key]: value },
    }));
  }

  function setNotifications<K extends keyof AgentSettings["notifications"]>(
    key: K,
    value: AgentSettings["notifications"][K],
  ) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  }

  function setAutoSleep<K extends keyof AgentSettings["autoSleep"]>(
    key: K,
    value: AgentSettings["autoSleep"][K],
  ) {
    setSettings((prev) => ({
      ...prev,
      autoSleep: { ...prev.autoSleep, [key]: value },
    }));
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 sm:px-8 sm:py-10 w-full">
      {/* Header */}
      <div className="text-center flex flex-col gap-2 pt-8 sm:pt-0">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Configure Agent Settings
        </h2>
        <p className="text-sm text-white/40">
          Your default settings are applied automatically. You can review or
          change them before deployment.
        </p>
      </div>

      <div className="w-full flex flex-col gap-10">
        {/* Agent Identity */}
        <div>
          <SectionHeader
            title="Agent Identity"
            subtitle="Give your agent a name and a short description so you can easily identify it."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/80">
                Agent Name
              </label>
              <input
                type="text"
                placeholder="e.g. My Trading Agent"
                value={settings.agentName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    agentName: e.target.value,
                  }))
                }
                maxLength={60}
                className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/80">
                Description
              </label>
              <input
                type="text"
                placeholder="What does this agent do?"
                value={settings.agentDescription}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    agentDescription: e.target.value,
                  }))
                }
                maxLength={200}
                className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <SectionHeader
            title="Skills"
            subtitle="Enable capabilities that allow your agent to interact with tools, services, and external systems."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILL_OPTIONS.map((skill) => (
              <SettingCard
                key={skill.id}
                label={skill.label}
                desc={skill.desc}
                right={
                  <Switch
                    checked={settings.skills.includes(skill.id)}
                    onChange={() => toggleSkill(skill.id)}
                  />
                }
              />
            ))}
          </div>
        </div>

        {/* Private Memory */}
        <div>
          <SectionHeader
            title="Private Memory"
            subtitle="Allow your agent to securely store and recall information across sessions using encrypted storage."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingCard
              label="Enable Private Memory"
              desc="Allow your agent to securely store and recall information across sessions using encrypted storage."
              right={
                <Switch
                  checked={settings.memory.enablePrivateMemory}
                  onChange={(v) => setMemory("enablePrivateMemory", v)}
                />
              }
            />
            <SettingCard
              label="Persistent Memory"
              desc="Keep memory stored permanently so the agent can recall it after restarts."
              right={
                <Switch
                  checked={settings.memory.persistentMemory}
                  onChange={(v) => setMemory("persistentMemory", v)}
                />
              }
            />
            <SettingCard
              label="Encryption"
              desc="All memory is encrypted to ensure privacy and secure storage."
              right={
                <Switch
                  checked={settings.memory.encryption}
                  onChange={(v) => setMemory("encryption", v)}
                />
              }
            />
          </div>
        </div>

        {/* Agent Behavior */}
        <div>
          <SectionHeader
            title="Agent Behavior"
            subtitle="Control how the agent executes tasks and responds during runtime."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingCard
              label="Autonomous Mode"
              desc="Allow the agent to execute tasks automatically without manual approval."
              right={
                <Switch
                  checked={settings.agentBehavior.autonomousMode}
                  onChange={(v) => setBehavior("autonomousMode", v)}
                />
              }
            />
            <SettingCard
              label="Task Timeout"
              desc="Set the maximum time a task can run before it is stopped."
              right={
                <div className="flex items-center gap-1.5">
                  <NumberInput
                    value={settings.agentBehavior.taskTimeout}
                    onChange={(v) => setBehavior("taskTimeout", v)}
                  />
                  <span className="text-xs text-white/30">sec</span>
                </div>
              }
            />
            <SettingCard
              label="Max Concurrent Tasks"
              desc="Limit how many tasks the agent can process at the same time."
              right={
                <NumberInput
                  value={settings.agentBehavior.maxConcurrentTasks}
                  onChange={(v) => setBehavior("maxConcurrentTasks", v)}
                />
              }
            />
          </div>
        </div>

        {/* Notification */}
        <div>
          <SectionHeader
            title="Notification"
            subtitle="Configure how your agent sends updates and alerts when tasks run or complete."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingCard
              label="Webhook Notifications"
              desc="Send task updates to an external service using a webhook endpoint."
              right={
                <Switch
                  checked={settings.notifications.webhookNotifications}
                  onChange={(v) => setNotifications("webhookNotifications", v)}
                />
              }
            />
            <SettingCard
              label="Email Alerts"
              desc="Receive email notifications when tasks complete or encounter errors."
              right={
                <Switch
                  checked={settings.notifications.emailAlerts}
                  onChange={(v) => setNotifications("emailAlerts", v)}
                />
              }
            />
            <SettingCard
              label="Task Reports"
              desc="Generate summary reports for completed tasks and activities."
              right={
                <Switch
                  checked={settings.notifications.taskReports}
                  onChange={(v) => setNotifications("taskReports", v)}
                />
              }
            />
          </div>
        </div>

        {/* Auto Sleep */}
        <div>
          <SectionHeader
            title="Auto Sleep"
            subtitle="Automatically sleep the GPU when the agent is idle to reduce cost."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SettingCard
              label="Enable Auto Sleep"
              desc="Sleep the GPU when the agent is idle to save cost."
              right={
                <Switch
                  checked={settings.autoSleep.enableAutoSleep}
                  onChange={(v) => setAutoSleep("enableAutoSleep", v)}
                />
              }
            />
            <SettingCard
              label="Idle Timeout"
              desc="Set how long the agent must be idle before the GPU sleeps."
              right={
                <div className="flex items-center gap-1.5">
                  <NumberInput
                    value={settings.autoSleep.idleTimeout}
                    onChange={(v) => setAutoSleep("idleTimeout", v)}
                  />
                  <span className="text-xs text-white/30">min</span>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="glass"
        size="md"
        onClick={() => onNext(settings)}
        disabled={
          !settings.agentName.trim() || !settings.agentDescription.trim()
        }
        className="rounded-full px-10 mt-2"
      >
        Continue
      </Button>

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide">3 / 5</p>
    </div>
  );
}
