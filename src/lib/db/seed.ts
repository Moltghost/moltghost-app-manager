import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { models } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Seeding models...");

  await db
    .insert(models)
    .values([
      {
        id: "qwen3:8b",
        label: "Qwen 3 8B",
        size: "~5 GB",
        desc: "All-rounder",
        recommended: true,
        image: "moltghost/moltghost-agent:latest",
        minVram: 8,
      },
      {
        id: "phi4-mini",
        label: "Phi-4 Mini 3.8B",
        size: "~2.5 GB",
        desc: "Fast & light",
        recommended: false,
        image: "moltghost/moltghost-agent:phi4-mini",
        minVram: 4,
      },
      {
        id: "llama3.1:8b",
        label: "Llama 3.1 8B",
        size: "~4.7 GB",
        desc: "Strong reasoning",
        recommended: false,
        image: "moltghost/moltghost-agent:llama3.1-8b",
        minVram: 8,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Seeded 3 models");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
