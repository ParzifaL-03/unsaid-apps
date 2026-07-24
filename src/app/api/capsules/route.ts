import { NextRequest } from "next/server";
import {
  capsuleResponseSchema,
  capsulesResponseSchema,
  createCapsuleInputSchema,
} from "@/contracts/content";
import { requireSessionUser } from "@/server/auth/session";
import { handleApiError, jsonResponse, parseJson } from "@/server/http";
import { createCapsule, listCapsules } from "@/server/services/capsule.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser(request);
    return jsonResponse(capsulesResponseSchema, {
      capsules: await listCapsules(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser(request);
    const input = await parseJson(request, createCapsuleInputSchema);
    return jsonResponse(
      capsuleResponseSchema,
      { capsule: await createCapsule(user, input) },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
