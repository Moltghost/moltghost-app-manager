import type {
  AgentSettings,
  Deployment,
  DeploymentMode,
  ModelOption,
} from "../types";

export async function fetchModels(): Promise<ModelOption[]> {
  const res = await fetch("/api/models");
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function createDeployment(payload: {
  mode: DeploymentMode;
  model: ModelOption;
  settings: AgentSettings;
}): Promise<Deployment> {
  const { mode, model, settings } = payload;
  const res = await fetch("/api/deployments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export async function getDeployment(id: string): Promise<Deployment> {
  const res = await fetch(`/api/deployments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deployment");
  return res.json();
}

export async function getDeployments(): Promise<Deployment[]> {
  const res = await fetch("/api/deployments");
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
}

export async function updateDeploymentStatus(
  id: string,
  status: Deployment["status"],
): Promise<Deployment> {
  const res = await fetch(`/api/deployments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update deployment");
  return res.json();
}

export async function deleteDeployment(id: string): Promise<void> {
  const res = await fetch(`/api/deployments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete deployment");
}
