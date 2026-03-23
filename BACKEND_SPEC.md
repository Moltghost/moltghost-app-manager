# MoltGhost Backend — Agent Build Instructions

> **FOR AI AGENTS**: Read this document end-to-end, then create ALL files listed below
> at the path `/Users/devasya/Work/MOLTGHOST/moltghost-backend/`.
> Create directories as needed. Do not skip any file. Run the setup commands at the end.

---

## Project Overview

Standalone Express.js + TypeScript backend that handles all server-side logic for the
MoltGhost platform. The Next.js app (`moltghost-app-manager`) becomes a pure frontend
(wallet connect + UI only). This backend owns the database, auth, RunPod orchestration,
Cloudflare tunnel management, and real-time communication.

**Target folder**: `/Users/devasya/Work/MOLTGHOST/moltghost-backend/`

**Source reference**: `/Users/devasya/Work/MOLTGHOST/moltghost-app-manager/`

---

## Stack

| Layer        | Choice                                     |
|--------------|--------------------------------------------|
| Runtime      | Node.js 20 + TypeScript                    |
| Framework    | Express.js                                 |
| Database     | Neon Serverless PostgreSQL + Drizzle ORM   |
| Auth         | Privy JWT (`@privy-io/node`)               |
| Real-time    | `ws` v8 WebSocket + SSE fallback           |
| Pod provider | RunPod GPU cloud (GraphQL)                 |
| Tunnel       | Cloudflare Tunnel + DNS CNAME              |

---

## Directory Structure to Create

```
moltghost-backend/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── .gitignore
└── src/
    ├── index.ts
    ├── types/
    │   └── index.ts
    ├── db/
    │   ├── index.ts
    │   ├── schema.ts
    │   └── seed.ts
    ├── lib/
    │   ├── privy.ts
    │   ├── cloudflare.ts
    │   └── runpod.ts
    ├── middleware/
    │   └── auth.ts
    ├── ws/
    │   └── wsServer.ts
    └── routes/
        ├── models.ts
        ├── runpod.ts
        └── deployments.ts
```

---

## Step 1 — `package.json`

```json
{
  "name": "moltghost-backend",
  "version": "1.0.0",
  "description": "MoltGhost API server",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx src/db/seed.ts",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "@paralleldrive/cuid2": "^2.2.2",
    "@privy-io/node": "^0.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "drizzle-orm": "^0.41.0",
    "express": "^4.19.2",
    "ws": "^8.17.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "@types/ws": "^8.5.11",
    "drizzle-kit": "^0.30.0",
    "nodemon": "^3.1.4",
    "tsx": "^4.15.6",
    "typescript": "^5.4.5"
  }
}
```

---

## Step 2 — `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "drizzle.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 3 — `.env.example`

```env
# Server
PORT=3001

# Database (Neon Serverless PostgreSQL — same DB as Next.js app)
DATABASE_URL=postgresql://...

# Privy Auth
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret

# RunPod
RUNPOD_API_KEY=your-runpod-api-key
RUNPOD_NETWORK_VOLUME_ID=vol_xxxxxxxx
RUNPOD_ALLOWED_GPU_IDS=NVIDIA GeForce RTX 4090,NVIDIA RTX 4000 Ada

# Cloudflare Tunnel
CLOUDFLARE_ACCOUNT_ID=your-cf-account-id
CLOUDFLARE_API_TOKEN=your-cf-api-token
CLOUDFLARE_ZONE_ID=your-cf-zone-id
CLOUDFLARE_TUNNEL_DOMAIN=moltghost.io

# Internal secrets (used by CF Worker and deployment callbacks)
DEPLOY_SECRET=random-secret-string-for-internal-orchestration
WORKER_SECRET=random-secret-string-for-worker-to-server-calls

# CF Worker URL (fires deployment orchestration)
WORKER_URL=https://moltghost-worker.your-account.workers.dev

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Step 4 — `.gitignore`

```gitignore
node_modules/
dist/
.env
*.js.map
drizzle/
```

---

## Step 5 — `drizzle.config.ts`

```typescript
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

---

## Step 6 — `src/types/index.ts`

```typescript
// CloudInitConfig — passed to generateStartupScript() in lib/runpod.ts
export interface CloudInitConfig {
  agentId: string;
  agentDomain: string;     // e.g. "agent-abc123.moltghost.io"
  gatewayToken: string;
  callbackUrl: string;     // backend URL the pod calls when ready
  callbackSecret: string;
  logUrl: string;          // backend URL the pod streams logs to
  tunnelToken: string;     // Cloudflare tunnel credential
  model?: string;          // e.g. "qwen3:8b"
}

// Augment Express Request so middleware can attach the authed user
declare global {
  namespace Express {
    interface Request {
      user?: {
        privyId: string;
        walletAddress?: string;
      };
    }
  }
}
```

---

## Step 7 — `src/db/index.ts`

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

---

## Step 8 — `src/db/schema.ts`

> This is the EXTENDED schema. It adds new columns to `deployments` and a new
> `deploymentLogs` table. Run `pnpm db:generate` + `pnpm db:migrate` after creating this.

```typescript
import {
  pgTable,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const deploymentModeEnum = pgEnum("deployment_mode", [
  "dedicated",
  "shared",
  "external",
]);

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "pending",
  "provisioning",   // NEW: pod is being created on RunPod
  "starting",       // NEW: pod is up, agent is initializing
  "running",
  "stopped",
  "failed",
]);

// ─── Models ──────────────────────────────────────────────────────────────────

export const models = pgTable("models", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  size: text("size").notNull(),
  desc: text("desc").notNull(),
  recommended: boolean("recommended").notNull().default(false),
  image: text("image").notNull(),
  minVram: integer("min_vram").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Deployments ─────────────────────────────────────────────────────────────

export const deployments = pgTable("deployments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Owner
  userId: text("user_id").notNull(),

  // Step 1/5 – deployment mode
  mode: deploymentModeEnum("mode").notNull(),

  // Step 2/5 – model (denormalized for immutable history)
  modelId: text("model_id")
    .notNull()
    .references(() => models.id),
  modelLabel: text("model_label").notNull(),
  modelSize: text("model_size").notNull(),
  modelImage: text("model_image").notNull(),
  modelMinVram: integer("model_min_vram").notNull(),

  // Step 3/5 – agent settings
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  memory: jsonb("memory")
    .$type<{
      enablePrivateMemory: boolean;
      persistentMemory: boolean;
      encryption: boolean;
    }>()
    .notNull()
    .default({
      enablePrivateMemory: false,
      persistentMemory: false,
      encryption: false,
    }),
  agentBehavior: jsonb("agent_behavior")
    .$type<{
      autonomousMode: boolean;
      taskTimeout: number;
      maxConcurrentTasks: number;
    }>()
    .notNull()
    .default({ autonomousMode: false, taskTimeout: 30, maxConcurrentTasks: 3 }),
  notifications: jsonb("notifications")
    .$type<{
      webhookNotifications: boolean;
      emailAlerts: boolean;
      taskReports: boolean;
    }>()
    .notNull()
    .default({
      webhookNotifications: false,
      emailAlerts: false,
      taskReports: false,
    }),
  autoSleep: jsonb("auto_sleep")
    .$type<{
      enableAutoSleep: boolean;
      idleTimeout: number;
    }>()
    .notNull()
    .default({ enableAutoSleep: false, idleTimeout: 15 }),

  // RunPod / infra (nullable until provisioned)
  podId: text("pod_id"),
  tunnelId: text("tunnel_id"),
  tunnelToken: text("tunnel_token"),
  agentDomain: text("agent_domain"),  // e.g. "agent-abc123.moltghost.io"
  dnsRecordId: text("dns_record_id"),

  // Lifecycle
  status: deploymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Deployment Logs ─────────────────────────────────────────────────────────

export const deploymentLogs = pgTable("deployment_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  deploymentId: text("deployment_id")
    .notNull()
    .references(() => deployments.id, { onDelete: "cascade" }),
  level: text("level").notNull().default("info"), // "info" | "warn" | "error"
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
export type DeploymentLog = typeof deploymentLogs.$inferSelect;
export type NewDeploymentLog = typeof deploymentLogs.$inferInsert;
```

---

## Step 9 — `src/db/seed.ts`

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { models } from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

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
        image: "moltghost/moltghost-agent:latest",
        minVram: 4,
      },
      {
        id: "llama3.2:3b",
        label: "Llama 3.2 3B",
        size: "~2 GB",
        desc: "Compact reasoning",
        recommended: false,
        image: "moltghost/moltghost-agent:latest",
        minVram: 4,
      },
    ])
    .onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## Step 10 — `src/lib/privy.ts`

> Copy from `../moltghost-app-manager/src/lib/lib_privy.ts` verbatim.
> Then change any `@/` path aliases to relative paths (`../` etc.) if present.
> Remove any Next.js-specific imports (`next/headers`, etc.).

---

## Step 11 — `src/lib/cloudflare.ts`

> Copy from `../moltghost-app-manager/src/lib/lib_cloudflare.ts` verbatim.
> No changes needed — it has no Next.js-specific imports.

---

## Step 12 — `src/lib/runpod.ts`

> Copy from `../moltghost-app-manager/src/lib/lib_runpod.ts` verbatim.
> **ONE CHANGE REQUIRED**: At the top of the file, change:
> ```typescript
> import type { CloudInitConfig } from "@/types/agent";
> ```
> to:
> ```typescript
> import type { CloudInitConfig } from "../types";
> ```

---

## Step 13 — `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { PrivyClient } from "@privy-io/node";

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

/**
 * requireAuth — verifies Bearer JWT from Privy.
 * Attaches req.user = { privyId, walletAddress } on success.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Bearer token" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const claims = await privy.verifyAuthToken(token);
    const user = await privy.getUser(claims.userId);

    const wallet =
      user.linkedAccounts.find(
        (a) => a.type === "wallet" && a.chainType === "ethereum"
      ) as { address?: string } | undefined;

    req.user = {
      privyId: claims.userId,
      walletAddress: wallet?.address,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * requireDeploySecret — guards internal orchestration endpoints.
 * Header: X-Deploy-Secret: <DEPLOY_SECRET env var>
 */
export function requireDeploySecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers["x-deploy-secret"];
  if (secret !== process.env.DEPLOY_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

/**
 * requireWorkerSecret — guards CF Worker callback endpoints.
 * Header: X-Worker-Secret: <WORKER_SECRET env var>
 */
export function requireWorkerSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers["x-worker-secret"];
  if (secret !== process.env.WORKER_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
```

---

## Step 14 — `src/ws/wsServer.ts`

```typescript
import { EventEmitter } from "events";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import { PrivyClient } from "@privy-io/node";
import { db } from "../db";
import { deployments } from "../db/schema";
import { eq } from "drizzle-orm";

export const deploymentEmitter = new EventEmitter();

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

interface AuthedSocket extends WebSocket {
  privyId?: string;
  subscribedDeploymentId?: string;
  isAlive?: boolean;
}

/**
 * Attach a WebSocket server to the existing HTTP server.
 * Clients connect to ws://<host>/ws
 */
export function attachWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", async (ws: AuthedSocket, req: IncomingMessage) => {
    ws.isAlive = true;

    // ── Auth handshake ────────────────────────────────────────────────────
    // Expect token in query string: /ws?token=<privy-jwt>
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Missing token");
      return;
    }

    try {
      const claims = await privy.verifyAuthToken(token);
      ws.privyId = claims.userId;
    } catch {
      ws.close(4001, "Invalid token");
      return;
    }

    ws.send(JSON.stringify({ type: "connected", privyId: ws.privyId }));

    // ── Message handling ──────────────────────────────────────────────────
    ws.on("message", async (raw) => {
      let msg: { type: string; deploymentId?: string };

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (msg.type === "subscribe" && msg.deploymentId) {
        // Verify ownership before subscribing
        const [deployment] = await db
          .select()
          .from(deployments)
          .where(eq(deployments.id, msg.deploymentId));

        if (!deployment || deployment.userId !== ws.privyId) {
          ws.send(
            JSON.stringify({ type: "error", message: "Deployment not found" })
          );
          return;
        }

        ws.subscribedDeploymentId = msg.deploymentId;
        ws.send(
          JSON.stringify({
            type: "subscribed",
            deploymentId: msg.deploymentId,
          })
        );
      }

      if (msg.type === "unsubscribe") {
        ws.subscribedDeploymentId = undefined;
        ws.send(JSON.stringify({ type: "unsubscribed" }));
      }

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    });

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      ws.subscribedDeploymentId = undefined;
    });
  });

  // ── Broadcast deployment events to subscribed clients ──────────────────
  deploymentEmitter.on(
    "status",
    (deploymentId: string, status: string) => {
      wss.clients.forEach((client) => {
        const sock = client as AuthedSocket;
        if (
          sock.readyState === WebSocket.OPEN &&
          sock.subscribedDeploymentId === deploymentId
        ) {
          sock.send(JSON.stringify({ type: "status", deploymentId, status }));
        }
      });
    }
  );

  deploymentEmitter.on(
    "log",
    (deploymentId: string, level: string, message: string) => {
      wss.clients.forEach((client) => {
        const sock = client as AuthedSocket;
        if (
          sock.readyState === WebSocket.OPEN &&
          sock.subscribedDeploymentId === deploymentId
        ) {
          sock.send(
            JSON.stringify({ type: "log", deploymentId, level, message })
          );
        }
      });
    }
  );

  // ── Heartbeat interval ────────────────────────────────────────────────────
  const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
      const sock = client as AuthedSocket;
      if (!sock.isAlive) {
        sock.terminate();
        return;
      }
      sock.isAlive = false;
      sock.ping();
    });
  }, 30_000);

  wss.on("close", () => clearInterval(heartbeat));

  return wss;
}
```

---

## Step 15 — `src/routes/models.ts`

```typescript
import { Router } from "express";
import { db } from "../db";
import { models } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/models
router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(models)
      .where(eq(models.isActive, true));
    res.json(rows);
  } catch (err) {
    console.error("GET /api/models", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
```

---

## Step 16 — `src/routes/runpod.ts`

```typescript
import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

// 5-minute in-memory cache for GPU types
let gpuCache: { data: unknown; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

// GET /api/runpod/gpu-types
router.get("/gpu-types", requireAuth, async (_req, res) => {
  try {
    if (gpuCache && Date.now() - gpuCache.fetchedAt < CACHE_TTL_MS) {
      res.json(gpuCache.data);
      return;
    }

    const response = await fetch("https://api.runpod.io/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({
        query: `{
          gpuTypes {
            id
            displayName
            memoryInGb
            securePrice
            communityPrice
            lowestPrice {
              minimumBidPrice
              uninterruptablePrice
            }
          }
        }`,
      }),
    });

    const json = await response.json() as { data?: { gpuTypes?: unknown[] } };
    const gpuTypes = json.data?.gpuTypes ?? [];

    // Filter to only allowed GPU IDs if env var is set
    const allowed = process.env.RUNPOD_ALLOWED_GPU_IDS
      ? process.env.RUNPOD_ALLOWED_GPU_IDS.split(",").map((s) => s.trim())
      : null;

    const filtered = allowed
      ? (gpuTypes as Array<{ displayName: string }>).filter((g) =>
          allowed.includes(g.displayName)
        )
      : gpuTypes;

    gpuCache = { data: filtered, fetchedAt: Date.now() };
    res.json(filtered);
  } catch (err) {
    console.error("GET /api/runpod/gpu-types", err);
    res.status(500).json({ error: "Failed to fetch GPU types" });
  }
});

export default router;
```

---

## Step 17 — `src/routes/deployments.ts`

```typescript
import { Router, Request, Response } from "express";
import { db } from "../db";
import { deployments, deploymentLogs } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireDeploySecret, requireWorkerSecret } from "../middleware/auth";
import { deploymentEmitter } from "../ws/wsServer";
import { createTunnel, createTunnelDns, deleteTunnel, deleteDnsRecord } from "../lib/cloudflare";
import { createPod, stopPod, deletePod, generateStartupScript } from "../lib/runpod";
import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";

const router = Router();

// ─── User CRUD ────────────────────────────────────────────────────────────────

// GET /api/deployments
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(deployments)
      .where(eq(deployments.userId, req.user!.privyId))
      .orderBy(desc(deployments.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/deployments/:id
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db
      .select()
      .from(deployments)
      .where(
        and(
          eq(deployments.id, req.params.id),
          eq(deployments.userId, req.user!.privyId)
        )
      );
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/deployments — create new deployment (triggers CF Worker)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const [deployment] = await db
      .insert(deployments)
      .values({
        userId: req.user!.privyId,
        mode: body.mode,
        modelId: body.modelId,
        modelLabel: body.modelLabel,
        modelSize: body.modelSize,
        modelImage: body.modelImage,
        modelMinVram: body.modelMinVram,
        skills: body.skills ?? [],
        memory: body.memory,
        agentBehavior: body.agentBehavior,
        notifications: body.notifications,
        autoSleep: body.autoSleep,
        status: "pending",
      })
      .returning();

    // Fire-and-forget to Cloudflare Worker (background orchestration)
    const workerUrl = process.env.WORKER_URL;
    if (workerUrl) {
      fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Worker-Secret": process.env.WORKER_SECRET!,
        },
        body: JSON.stringify({ deploymentId: deployment.id }),
      }).catch((e) => console.error("Worker trigger failed:", e));
    } else {
      // Dev fallback: call internal orchestrate directly
      fetch(
        `http://localhost:${process.env.PORT ?? 3001}/api/deployments/internal/orchestrate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Deploy-Secret": process.env.DEPLOY_SECRET!,
          },
          body: JSON.stringify({ deploymentId: deployment.id }),
        }
      ).catch((e) => console.error("Dev orchestrate failed:", e));
    }

    res.status(201).json(deployment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/deployments/:id — stop pod and cleanup
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [deployment] = await db
      .select()
      .from(deployments)
      .where(
        and(
          eq(deployments.id, req.params.id),
          eq(deployments.userId, req.user!.privyId)
        )
      );

    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }

    // Cleanup RunPod + Cloudflare resources asynchronously
    if (deployment.podId) {
      stopPod(deployment.podId).catch(console.error);
      deletePod(deployment.podId).catch(console.error);
    }
    if (deployment.tunnelId) {
      deleteTunnel(deployment.tunnelId).catch(console.error);
    }
    if (deployment.dnsRecordId) {
      deleteDnsRecord(deployment.dnsRecordId).catch(console.error);
    }

    await db
      .update(deployments)
      .set({ status: "stopped", updatedAt: new Date() })
      .where(eq(deployments.id, req.params.id));

    deploymentEmitter.emit("status", req.params.id, "stopped");

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Logs ─────────────────────────────────────────────────────────────────────

// POST /api/deployments/:id/logs — pod pushes log entries
router.post("/:id/logs", requireWorkerSecret, async (req: Request, res: Response) => {
  try {
    const { level = "info", message } = req.body as { level?: string; message: string };

    await db.insert(deploymentLogs).values({
      deploymentId: req.params.id,
      level,
      message,
    });

    deploymentEmitter.emit("log", req.params.id, level, message);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/deployments/:id/logs — fetch stored logs (paginated)
router.get("/:id/logs", requireAuth, async (req: Request, res: Response) => {
  try {
    // Verify ownership first
    const [deployment] = await db
      .select({ id: deployments.id })
      .from(deployments)
      .where(
        and(
          eq(deployments.id, req.params.id),
          eq(deployments.userId, req.user!.privyId)
        )
      );
    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }

    const limit = Math.min(parseInt((req.query.limit as string) ?? "100"), 500);
    const logs = await db
      .select()
      .from(deploymentLogs)
      .where(eq(deploymentLogs.deploymentId, req.params.id))
      .orderBy(desc(deploymentLogs.createdAt))
      .limit(limit);

    res.json(logs.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/deployments/:id/logs/stream — SSE real-time log stream
router.get("/:id/logs/stream", requireAuth, async (req: Request, res: Response) => {
  try {
    const [deployment] = await db
      .select({ id: deployments.id })
      .from(deployments)
      .where(
        and(
          eq(deployments.id, req.params.id),
          eq(deployments.userId, req.user!.privyId)
        )
      );
    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendLog = (depId: string, level: string, message: string) => {
      if (depId !== req.params.id) return;
      res.write(`data: ${JSON.stringify({ level, message })}\n\n`);
    };

    const sendStatus = (depId: string, status: string) => {
      if (depId !== req.params.id) return;
      res.write(`event: status\ndata: ${JSON.stringify({ status })}\n\n`);
    };

    deploymentEmitter.on("log", sendLog);
    deploymentEmitter.on("status", sendStatus);

    req.on("close", () => {
      deploymentEmitter.off("log", sendLog);
      deploymentEmitter.off("status", sendStatus);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Pod callback (pod → backend when ready) ──────────────────────────────────

// POST /api/deployments/:id/callback
router.post("/:id/callback", requireWorkerSecret, async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: "running" | "failed" };

    await db
      .update(deployments)
      .set({ status, updatedAt: new Date() })
      .where(eq(deployments.id, req.params.id));

    deploymentEmitter.emit("status", req.params.id, status);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Internal orchestration ───────────────────────────────────────────────────

// POST /api/deployments/internal/orchestrate
// Called by CF Worker (or dev fallback). Creates tunnel + pod.
router.post(
  "/internal/orchestrate",
  requireDeploySecret,
  async (req: Request, res: Response) => {
    const { deploymentId } = req.body as { deploymentId: string };

    if (!deploymentId) {
      res.status(400).json({ error: "deploymentId required" });
      return;
    }

    res.status(202).json({ message: "Orchestration started" });

    // Run async — errors are logged but not returned to caller
    (async () => {
      try {
        const [deployment] = await db
          .select()
          .from(deployments)
          .where(eq(deployments.id, deploymentId));

        if (!deployment) throw new Error(`Deployment ${deploymentId} not found`);

        // 1. Mark provisioning
        await db
          .update(deployments)
          .set({ status: "provisioning", updatedAt: new Date() })
          .where(eq(deployments.id, deploymentId));
        deploymentEmitter.emit("status", deploymentId, "provisioning");

        // 2. Create Cloudflare tunnel
        const shortId = deploymentId.slice(0, 8);
        const subdomain = `agent-${shortId}`;
        const tunnel = await createTunnel(`moltghost-${shortId}`);
        const dnsRecord = await createTunnelDns(tunnel.id, subdomain);

        await db
          .update(deployments)
          .set({
            tunnelId: tunnel.id,
            tunnelToken: tunnel.token,
            agentDomain: `${subdomain}.${process.env.CLOUDFLARE_TUNNEL_DOMAIN}`,
            dnsRecordId: dnsRecord.id,
            updatedAt: new Date(),
          })
          .where(eq(deployments.id, deploymentId));

        // 3. Generate startup script
        const callbackSecret = crypto.randomBytes(16).toString("hex");
        const backendBase =
          process.env.BACKEND_PUBLIC_URL ??
          `http://localhost:${process.env.PORT ?? 3001}`;

        const startupScript = generateStartupScript({
          agentId: deploymentId,
          agentDomain: `${subdomain}.${process.env.CLOUDFLARE_TUNNEL_DOMAIN}`,
          gatewayToken: callbackSecret,
          callbackUrl: `${backendBase}/api/deployments/${deploymentId}/callback`,
          callbackSecret: process.env.WORKER_SECRET!,
          logUrl: `${backendBase}/api/deployments/${deploymentId}/logs`,
          tunnelToken: tunnel.token,
          model: deployment.modelId,
        });

        // 4. Mark starting + create pod
        await db
          .update(deployments)
          .set({ status: "starting", updatedAt: new Date() })
          .where(eq(deployments.id, deploymentId));
        deploymentEmitter.emit("status", deploymentId, "starting");

        const pod = await createPod({
          name: `moltghost-${shortId}`,
          imageName: deployment.modelImage,
          gpuTypeId: "NVIDIA GeForce RTX 4090", // TODO: make configurable
          startupScript,
        });

        await db
          .update(deployments)
          .set({ podId: pod.id, updatedAt: new Date() })
          .where(eq(deployments.id, deploymentId));

        // Pod will call /callback when ready — status updated there
      } catch (err) {
        console.error("Orchestration failed", err);
        await db
          .update(deployments)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(deployments.id, deploymentId));
        deploymentEmitter.emit("status", deploymentId, "failed");
      }
    })();
  }
);

// GET /api/deployments/internal/pending-deployments
// CF Worker cron polls this to re-queue stuck pending deployments
router.get(
  "/internal/pending-deployments",
  requireDeploySecret,
  async (_req: Request, res: Response) => {
    try {
      const rows = await db
        .select({ id: deployments.id })
        .from(deployments)
        .where(eq(deployments.status, "pending"));
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
```

---

## Step 18 — `src/index.ts`

```typescript
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { attachWebSocketServer } from "./ws/wsServer";

import modelsRouter from "./routes/models";
import runpodRouter from "./routes/runpod";
import deploymentsRouter from "./routes/deployments";

const app = express();
const port = parseInt(process.env.PORT ?? "3001", 10);

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/models", modelsRouter);
app.use("/api/runpod", runpodRouter);
app.use("/api/deployments", deploymentsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ── HTTP + WebSocket server ────────────────────────────────────────────────────
const httpServer = createServer(app);
attachWebSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(`🚀 MoltGhost backend running on http://localhost:${port}`);
  console.log(`🔌 WebSocket server on ws://localhost:${port}/ws`);
});
```

---

## Step 19 — Setup Commands

Run these **inside** the `moltghost-backend/` directory:

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with real values

# 3. Generate Drizzle migrations for the new schema
pnpm db:generate

# 4. Apply migrations to Neon DB
pnpm db:migrate

# 5. Seed models table
pnpm db:seed

# 6. Start dev server
pnpm dev
```

---

## Step 20 — Update Next.js `.env.local`

Add to `/Users/devasya/Work/MOLTGHOST/moltghost-app-manager/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

In production, replace with the deployed backend URL.

---

## WebSocket — Frontend Message Reference

| Direction        | Message `type`   | Payload fields                                    |
|------------------|------------------|--------------------------------------------------|
| Server → Client  | `connected`       | `{ privyId }`                                    |
| Client → Server  | `subscribe`       | `{ deploymentId }`                               |
| Server → Client  | `subscribed`      | `{ deploymentId }`                               |
| Client → Server  | `unsubscribe`     | —                                                |
| Server → Client  | `unsubscribed`    | —                                                |
| Server → Client  | `status`          | `{ deploymentId, status }`                       |
| Server → Client  | `log`             | `{ deploymentId, level, message }`               |
| Client → Server  | `ping`            | —                                                |
| Server → Client  | `pong`            | —                                                |
| Server → Client  | `error`           | `{ message }`                                    |

**Connecting from Next.js frontend**:
```typescript
const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${privyToken}`);
ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", deploymentId }));
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "status") { /* update UI */ }
  if (msg.type === "log")    { /* append to log list */ }
};
```

---

## Deployment Flow (for reference)

```
Client                Backend              CF Worker            RunPod Pod
  │                      │                      │                    │
  │ POST /deployments     │                      │                    │
  │──────────────────────►│                      │                    │
  │ 201 { id, pending }   │                      │                    │
  │◄──────────────────────│                      │                    │
  │                       │ fire-and-forget POST  │                    │
  │                       │──────────────────────►│                    │
  │                       │                       │ POST /orchestrate  │
  │                       │◄──────────────────────│                    │
  │                       │ status: provisioning   │                    │
  │ WS status update      │                        │                    │
  │◄──────────────────────│                        │                    │
  │                       │ createTunnel()          │                    │
  │                       │ createTunnelDns()        │                    │
  │                       │ generateStartupScript()  │                    │
  │                       │ createPod()              │                    │
  │                       │ status: starting         │                    │
  │ WS status update      │                          │                    │
  │◄──────────────────────│                          │                    │
  │                       │                          │   POST /callback   │
  │                       │◄─────────────────────────────────────────────│
  │                       │ status: running            │                    │
  │ WS status update      │                             │                    │
  │◄──────────────────────│                             │                    │
```

---

## Security Notes

- `requireAuth` calls `privy.verifyAuthToken()` — production-safe JWT verification
- `requireDeploySecret` and `requireWorkerSecret` use constant-time comparison via
  direct string equality (acceptable for server-to-server secrets; upgrade to
  `crypto.timingSafeEqual` if needed)
- Never expose `DEPLOY_SECRET` or `WORKER_SECRET` to the frontend
- `userId` is always taken from the verified JWT (`req.user!.privyId`), never from
  request body — prevents horizontal privilege escalation
- Add `helmet()` and rate limiting (`express-rate-limit`) before production deploy
- Add `BACKEND_PUBLIC_URL` to `.env` when deploying (used in orchestrate for pod callback URLs)
