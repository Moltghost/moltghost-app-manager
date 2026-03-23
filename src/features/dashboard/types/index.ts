export interface DashboardUser {
  id: string;
  walletAddress: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DeploymentStatus =
  | "pending"
  | "provisioning"
  | "starting"
  | "running"
  | "stopped"
  | "failed";
export type DeploymentMode = "dedicated" | "shared" | "external";

export interface DashboardDeployment {
  id: string;
  userId: string;
  mode: DeploymentMode;
  modelId: string;
  modelLabel: string;
  modelSize: string;
  modelImage: string;
  modelMinVram: number;
  skills: string[];
  status: DeploymentStatus;
  createdAt: string;
  updatedAt: string;
  runpodPodId?: string;
  runpodEndpoint?: string;
  cloudflareUrl?: string;
}

export interface DashboardStats {
  totalDeployments: number;
  activeDeployments: number;
  totalSpent: number;
  loadingModels: boolean;
}
