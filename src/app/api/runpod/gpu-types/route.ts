import { NextResponse } from "next/server";

const RUNPOD_GRAPHQL = "https://api.runpod.io/graphql";

const QUERY = `
  query {
    gpuTypes {
      id
      displayName
      memoryInGb
      securePrice
      communityPrice
    }
  }
`;

// GPU IDs we care about — adjust as needed
const ALLOWED_GPU_IDS = [
  "NVIDIA L4",
  "NVIDIA RTX A4000",
  "NVIDIA GeForce RTX 3090",
];

export async function GET() {
  const apiKey = process.env.RUNPOD_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RunPod API key not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(`${RUNPOD_GRAPHQL}?api_key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY }),
    next: { revalidate: 300 }, // cache for 5 minutes
  });

  if (!res.ok) {
    return NextResponse.json({ error: "RunPod API error" }, { status: 502 });
  }

  const json = await res.json();
  const all: {
    id: string;
    displayName: string;
    memoryInGb: number;
    securePrice: number | null;
    communityPrice: number | null;
  }[] = json?.data?.gpuTypes ?? [];

  const filtered = all.filter((g) => ALLOWED_GPU_IDS.includes(g.id));

  return NextResponse.json(filtered);
}
