import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { id } = req.query;
  const auth = (req.headers.authorization as string) || "";

  try {
    const backendRes = await fetch(
      `${API_URL}/api/deployments/${id}/logs/stream`,
      {
        headers: { Authorization: auth },
      },
    );

    if (!backendRes.ok || !backendRes.body) {
      res.status(backendRes.status).json({ error: "Stream unavailable" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const reader = backendRes.body.getReader();
    const decoder = new TextDecoder();

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value, { stream: true }));
        }
      } catch {
        // Client disconnected or stream error
      } finally {
        res.end();
      }
    };

    req.on("close", () => {
      reader.cancel();
    });

    pump();
  } catch {
    res.status(502).json({ error: "Failed to connect to backend stream" });
  }
}
