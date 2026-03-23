// ─── Model ───────────────────────────────────────────────────────────────────

export interface ModelOption {
  id: string;
  label: string;
  size: string;
  desc: string;
  recommended: boolean;
  image: string;
  minVram: number;
}

// ─── Settings (Step 3/5) ─────────────────────────────────────────────────────

export interface AgentMemory {
  enablePrivateMemory: boolean;
  persistentMemory: boolean;
  encryption: boolean;
}

export interface AgentBehavior {
  autonomousMode: boolean;
  taskTimeout: number; // seconds
  maxConcurrentTasks: number;
}

export interface AgentNotifications {
  webhookNotifications: boolean;
  emailAlerts: boolean;
  taskReports: boolean;
}

export interface AgentAutoSleep {
  enableAutoSleep: boolean;
  idleTimeout: number; // minutes
}

export interface AgentSettings {
  skills: string[];
  memory: AgentMemory;
  agentBehavior: AgentBehavior;
  notifications: AgentNotifications;
  autoSleep: AgentAutoSleep;
}

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  skills: ["solana_private_transaction", "brave_search", "file_system_access"],
  memory: {
    enablePrivateMemory: true,
    persistentMemory: true,
    encryption: true,
  },
  agentBehavior: {
    autonomousMode: true,
    taskTimeout: 30,
    maxConcurrentTasks: 3,
  },
  notifications: {
    webhookNotifications: true,
    emailAlerts: false,
    taskReports: true,
  },
  autoSleep: {
    enableAutoSleep: true,
    idleTimeout: 5,
  },
};

// ─── GPU ──────────────────────────────────────────────────────────────────────

export interface GpuType {
  id: string;
  displayName: string;
  memoryInGb: number;
  securePrice: number | null;
  communityPrice: number | null;
  lowestPrice?: { minimumBidPrice: number; uninterruptablePrice: number };
}

// ─── Deployment ───────────────────────────────────────────────────────────────

export type DeploymentStatus =
  | "pending"
  | "provisioning"
  | "starting"
  | "running"
  | "stopped"
  | "failed";
export type DeploymentMode = "dedicated" | "shared" | "external";

export interface Deployment {
  id: string;
  userId: string;
  mode: DeploymentMode;
  modelId: string;
  modelLabel: string;
  modelSize: string;
  modelImage: string;
  modelMinVram: number;
  skills: string[];
  memory: AgentMemory;
  agentBehavior: AgentBehavior;
  notifications: AgentNotifications;
  autoSleep: AgentAutoSleep;
  status: DeploymentStatus;
  // infra fields (null until provisioned)
  podId: string | null;
  tunnelId: string | null;
  tunnelToken: string | null;
  agentDomain: string | null;
  dnsRecordId: string | null;
  createdAt: string;
  updatedAt: string;
}
