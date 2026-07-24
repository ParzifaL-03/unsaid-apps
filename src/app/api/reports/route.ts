import { NextRequest } from "next/server";
import {
  createReportInputSchema,
  reportResponseSchema,
} from "@/contracts/moderation";
import { requireSessionUser } from "@/server/auth/session";
import { handleApiError, jsonResponse, parseJson } from "@/server/http";
import { createReport } from "@/server/services/moderation.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser(request);
    const input = await parseJson(request, createReportInputSchema);
    return jsonResponse(
      reportResponseSchema,
      await createReport(user, input),
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
