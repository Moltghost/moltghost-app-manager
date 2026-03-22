import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deployments } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

const CreateDeploymentSchema = z.object({
  mode: z.enum(["dedicated", "shared", "external"]),
  modelId: z.string().min(1),
  modelLabel: z.string().min(1),
  modelSize: z.string().min(1),
  modelImage: z.string().min(1),
  modelMinVram: z.number().int().positive(),
  skills: z.array(z.string()).default([]),
  memory: z.object({
    enablePrivateMemory: z.boolean(),
    persistentMemory: z.boolean(),
    encryption: z.boolean(),
  }),
  agentBehavior: z.object({
    autonomousMode: z.boolean(),
    taskTimeout: z.number().int().positive(),
    maxConcurrentTasks: z.number().int().positive(),
  }),
  notifications: z.object({
    webhookNotifications: z.boolean(),
    emailAlerts: z.boolean(),
    taskReports: z.boolean(),
  }),
  autoSleep: z.object({
    enableAutoSleep: z.boolean(),
    idleTimeout: z.number().int().positive(),
  }),
});

export async function GET() {
  const data = await db
    .select()
    .from(deployments)
    .orderBy(desc(deployments.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateDeploymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [created] = await db
    .insert(deployments)
    .values(parsed.data)
    .returning();

  return NextResponse.json(created, { status: 201 });
}
