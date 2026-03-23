import type { AdminUser, AdminDeployment, AdminStats } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  try {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAdminDeployments(
  token: string,
): Promise<AdminDeployment[]> {
  try {
    const res = await fetch(`${API_URL}/api/admin/deployments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAdminStats(
  token: string,
): Promise<AdminStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
