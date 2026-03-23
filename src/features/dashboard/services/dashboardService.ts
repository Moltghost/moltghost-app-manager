import type { DashboardUser, DashboardDeployment } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchDashboardUser(
  token: string,
): Promise<DashboardUser | null> {
  try {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchUserDeployments(
  token: string,
): Promise<DashboardDeployment[]> {
  try {
    const res = await fetch(`${API_URL}/api/deployments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
