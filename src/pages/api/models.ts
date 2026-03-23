import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const backendRes = await fetch(`${API_URL}/api/models`);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
}
