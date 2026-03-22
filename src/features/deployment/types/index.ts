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
  skills: [],
  memory: {
    enablePrivateMemory: false,
    persistentMemory: false,
    encryption: false,
  },
  agentBehavior: {
    autonomousMode: false,
    taskTimeout: 30,
    maxConcurrentTasks: 3,
  },
  notifications: {
    webhookNotifications: false,
    emailAlerts: false,
    taskReports: false,
  },
  autoSleep: {
    enableAutoSleep: false,
    idleTimeout: 15,
  },
};

// ─── Deployment ───────────────────────────────────────────────────────────────

export type DeploymentStatus = "pending" | "running" | "stopped" | "failed";
export type DeploymentMode = "dedicated" | "shared" | "external";

export interface Deployment {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}
