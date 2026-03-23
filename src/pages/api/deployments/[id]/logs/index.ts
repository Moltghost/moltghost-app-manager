import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method, headers, query } = req;
  const { id } = query;
  const auth = headers.authorization || "";

  try {
    if (method === "GET") {
      const backendRes = await fetch(`${API_URL}/api/deployments/${id}/logs`, {
        headers: {
          Authorization: auth,
          "Cache-Control": "no-cache",
        },
      });
      const data = await backendRes.json();
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(backendRes.status).json(data);
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deployment logs" });
  }
}
