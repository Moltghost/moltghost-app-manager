import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { models } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(models).where(eq(models.isActive, true));
  return NextResponse.json(data);
}
