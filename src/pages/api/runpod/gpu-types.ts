import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const auth = req.headers.authorization || "";
  try {
    const apiKey =
      req.method === "POST" && typeof req.body?.apiKey === "string"
        ? req.body.apiKey
        : "";
    const backendRes = await fetch(`${API_URL}/api/runpod/gpu-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(apiKey ? { apiKey } : {}),
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch GPU types" });
  }
}
