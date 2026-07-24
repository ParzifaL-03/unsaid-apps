import { NextResponse } from "next/server";
import { connectMongo } from "@/server/db/connect";
import { handleApiError } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  try {
    const connection = await connectMongo();
    await connection.connection.db?.admin().ping();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
