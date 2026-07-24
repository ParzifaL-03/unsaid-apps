import type { z } from "zod";
import type { createReportInputSchema } from "@/contracts/moderation";
import { connectMongo } from "@/server/db/connect";
import { BlockModel, ReportModel, type UserDocument } from "@/server/db/models";
import { ApiError } from "@/server/http";

export async function createReport(
  user: UserDocument,
  input: z.infer<typeof createReportInputSchema>,
) {
  await connectMongo();
  const report = await ReportModel.create({
    reporterId: user._id,
    ...input,
  });
  return { id: report._id.toString(), status: "open" as const };
}

export async function blockUser(user: UserDocument, blockedUserId: string) {
  if (user._id.toString() === blockedUserId) {
    throw new ApiError(409, "SELF_BLOCK", "You cannot block your own account.");
  }
  await connectMongo();
  await BlockModel.updateOne(
    { blockerId: user._id, blockedUserId },
    { $setOnInsert: { blockerId: user._id, blockedUserId } },
    { upsert: true },
  );
  return { blocked: true };
}

export async function unblockUser(user: UserDocument, blockedUserId: string) {
  await connectMongo();
  await BlockModel.deleteOne({ blockerId: user._id, blockedUserId });
  return { blocked: false };
}
