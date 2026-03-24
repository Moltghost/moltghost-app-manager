import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method, headers, query, body } = req;
  const { id } = query;
  const auth = headers.authorization || "";
  let backendRes;
  let data;
  try {
    if (method === "GET") {
      backendRes = await fetch(`${API_URL}/api/deployments/${id}`, {
        headers: { Authorization: auth },
      });
      data = await backendRes.json();
      res.status(backendRes.status).json(data);
    } else if (method === "DELETE") {
      backendRes = await fetch(`${API_URL}/api/deployments/${id}`, {
        method: "DELETE",
        headers: { Authorization: auth },
      });
      if (backendRes.status === 204) {
        res.status(204).end();
      } else {
        data = await backendRes.json();
        res.status(backendRes.status).json(data);
      }
    } else if (method === "PATCH") {
      backendRes = await fetch(`${API_URL}/api/deployments/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      data = await backendRes.json();
      res.status(backendRes.status).json(data);
    } else {
      res.setHeader("Allow", ["GET", "DELETE", "PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to handle deployment" });
  }
}
