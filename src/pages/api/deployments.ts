import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method, headers, body, query } = req;
  const auth = headers.authorization || "";
  let backendRes;
  let data;
  try {
    if (method === "GET") {
      backendRes = await fetch(`${API_URL}/api/deployments`, {
        headers: { Authorization: auth },
      });
      data = await backendRes.json();
      res.status(backendRes.status).json(data);
    } else if (method === "POST") {
      backendRes = await fetch(`${API_URL}/api/deployments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: auth },
        body: JSON.stringify(body),
      });
      data = await backendRes.json();
      res.status(backendRes.status).json(data);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to handle deployments" });
  }
}
