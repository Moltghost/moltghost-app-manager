export interface AdminUser {
  id: string;
  walletAddress: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deploymentCount: number;
}

export interface AdminDeployment {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userWallet: string | null;
  agentName: string | null;
  agentDescription: string | null;
  isEncrypted: boolean;
  mode: "dedicated" | "shared" | "external";
  modelId: string;
  modelLabel: string;
  modelSize: string;
  modelImage: string;
  modelMinVram: number;
  skills: string[];
  status:
    | "pending"
    | "provisioning"
    | "starting"
    | "running"
    | "stopped"
    | "failed";
  createdAt: string;
  updatedAt: string;
  runpodPodId?: string;
  runpodEndpoint?: string;
  cloudflareUrl?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDeployments: number;
  activeDeployments: number;
  failedDeployments: number;
}
