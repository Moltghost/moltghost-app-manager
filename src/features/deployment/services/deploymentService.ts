import type {
  AgentSettings,
  Deployment,
  DeploymentMode,
  GpuType,
  ModelOption,
} from "../types";

// Use Next.js local API routes
const API_URL = "";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchModels(): Promise<ModelOption[]> {
  const res = await fetch(`/api/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function fetchGpuTypes(authToken: string): Promise<GpuType[]> {
  const res = await fetch(`/api/runpod/gpu-types`, {
    headers: authHeaders(authToken),
  });
  if (!res.ok) throw new Error("Failed to fetch GPU types");
  return res.json();
}

export async function createDeployment(
  payload: {
    mode: DeploymentMode;
    model: ModelOption;
    settings: AgentSettings;
  },
  authToken: string,
): Promise<Deployment> {
  const { mode, model, settings } = payload;
  const res = await fetch(`/api/deployments`, {
    method: "POST",
    headers: authHeaders(authToken),
    body: JSON.stringify({
      mode,
      modelId: model.id,
      modelLabel: model.label,
      modelSize: model.size,
      modelImage: model.image,
      modelMinVram: model.minVram,
      ...settings,
    }),
  });
  if (!res.ok) throw new Error("Failed to create deployment");
  return res.json();
}

export async function getDeployment(
  id: string,
  authToken: string,
): Promise<Deployment> {
  const res = await fetch(`/api/deployments/${id}`, {
    headers: authHeaders(authToken),
  });
  if (!res.ok) throw new Error("Failed to fetch deployment");
  return res.json();
}

export async function getDeployments(authToken: string): Promise<Deployment[]> {
  const res = await fetch(`/api/deployments`, {
    headers: authHeaders(authToken),
  });
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
}

export async function deleteDeployment(
  id: string,
  authToken: string,
): Promise<void> {
  const res = await fetch(`/api/deployments/${id}`, {
    method: "DELETE",
    headers: authHeaders(authToken),
  });
  if (!res.ok) throw new Error("Failed to delete deployment");
}
