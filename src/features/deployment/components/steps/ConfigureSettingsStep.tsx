"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_AGENT_SETTINGS,
  type AgentSettings,
} from "@/features/deployment/types";

interface ConfigureSettingsStepProps {
  onNext: (settings: AgentSettings) => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0",
        "focus:outline-none",
        checked
          ? "bg-white/40 [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.35)]"
          : "bg-white/10 [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.12)]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200",
          "bg-white/80 shadow-sm",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
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
    <div className="flex flex-col gap-0.5 mb-3">
      <h3 className="text-sm font-semibold text-white/80">{title}</h3>
      <p className="text-xs text-white/35">{subtitle}</p>
    </div>
  );
}

function SettingRow({
  label,
  desc,
  right,
}: {
  label: string;
  desc: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-medium text-white/70">{label}</span>
        <span className="text-[11px] text-white/35 leading-snug">{desc}</span>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

const SKILL_OPTIONS = [
  {
    id: "brave_private_transaction",
    label: "Brave Private Transaction",
    desc: "Execute secure and private transactions in the Brave browser.",
  },
  {
    id: "brave_search",
    label: "Brave Search",
    desc: "Search the web and retrieve the latest information.",
  },
  {
    id: "file_system_access",
    label: "File System Access",
    desc: "Read/write files on the local file system.",
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
    <div className="flex flex-col items-center gap-6 px-8 py-10 w-full">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Configure Agent Settings
        </h2>
        <p className="text-sm text-white/40">
          Your default settings are applied automatically. You can review or
          change them before deployment.
        </p>
      </div>

      <div className="w-full flex flex-col gap-6">
        {/* Skills */}
        <div>
          <SectionHeader
            title="Skills"
            subtitle="Enable capabilities that allow your agent to interact with tools, services, and external systems."
          />
          {SKILL_OPTIONS.map((skill) => (
            <SettingRow
              key={skill.id}
              label={skill.label}
              desc={skill.desc}
              right={
                <Toggle
                  checked={settings.skills.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                />
              }
            />
          ))}
        </div>

        {/* Private Memory */}
        <div>
          <SectionHeader
            title="Private Memory"
            subtitle="Configure how your agent stores and recalls information using ultra-private storage."
          />
          <SettingRow
            label="Enable Private Memory"
            desc="Allow your agent to save and recall information across agent interactions."
            right={
              <Toggle
                checked={settings.memory.enablePrivateMemory}
                onChange={(v) => setMemory("enablePrivateMemory", v)}
              />
            }
          />
          <SettingRow
            label="Persistent Memory"
            desc="Retain the agent's memories and key information until the agent is stopped."
            right={
              <Toggle
                checked={settings.memory.persistentMemory}
                onChange={(v) => setMemory("persistentMemory", v)}
              />
            }
          />
          <SettingRow
            label="Encryption"
            desc="Encrypts to ensure private memory to protect all data."
            right={
              <Toggle
                checked={settings.memory.encryption}
                onChange={(v) => setMemory("encryption", v)}
              />
            }
          />
        </div>

        {/* Agent Behavior */}
        <div>
          <SectionHeader
            title="Agent Behavior"
            subtitle="Control how the agent executes tasks and makes decisions on long runtimes."
          />
          <SettingRow
            label="Autonomous Mode"
            desc="Allow the agent to take actions and execute tasks automatically."
            right={
              <Toggle
                checked={settings.agentBehavior.autonomousMode}
                onChange={(v) => setBehavior("autonomousMode", v)}
              />
            }
          />
          <SettingRow
            label="Task Timeout"
            desc="Automatically cancel a task on the agent if it has not been completed in time."
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
          <SettingRow
            label="Max Concurrent Tasks"
            desc="Limit the number of active tasks that can run on the agent at the same time."
            right={
              <NumberInput
                value={settings.agentBehavior.maxConcurrentTasks}
                onChange={(v) => setBehavior("maxConcurrentTasks", v)}
              />
            }
          />
        </div>

        {/* Notification */}
        <div>
          <SectionHeader
            title="Notification"
            subtitle="Configure how your agent sends updates and alerts about task status and completions."
          />
          <SettingRow
            label="Webhook Notifications"
            desc="Send your agent updates and alerts to a configured webhook URL endpoint."
            right={
              <Toggle
                checked={settings.notifications.webhookNotifications}
                onChange={(v) => setNotifications("webhookNotifications", v)}
              />
            }
          />
          <SettingRow
            label="Email Alerts"
            desc="Receive email notifications when your agent completes, encounters a critical error."
            right={
              <Toggle
                checked={settings.notifications.emailAlerts}
                onChange={(v) => setNotifications("emailAlerts", v)}
              />
            }
          />
          <SettingRow
            label="Task Reports"
            desc="Schedule a schedule a periodic report for any task completed to a destination output."
            right={
              <Toggle
                checked={settings.notifications.taskReports}
                onChange={(v) => setNotifications("taskReports", v)}
              />
            }
          />
        </div>

        {/* Auto Sleep */}
        <div>
          <SectionHeader
            title="Auto Sleep"
            subtitle="Configure the SPS while the agent is idle on less active ops."
          />
          <SettingRow
            label="Enable Auto Sleep"
            desc="Put the agent to sleep to preserve agent clock time."
            right={
              <Toggle
                checked={settings.autoSleep.enableAutoSleep}
                onChange={(v) => setAutoSleep("enableAutoSleep", v)}
              />
            }
          />
          <SettingRow
            label="Idle Timeout"
            desc="The agent will automatically sleep after the specified idle time has elapsed."
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

      {/* CTA */}
      <Button
        variant="glass"
        size="md"
        onClick={() => onNext(settings)}
        className="rounded-full px-10 mt-2"
      >
        Continue
      </Button>

      {/* Step indicator */}
      <p className="text-sm text-white/30 tracking-wide">3 / 5</p>
    </div>
  );
}
