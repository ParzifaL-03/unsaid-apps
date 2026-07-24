import type { z } from "zod";
import type { createCapsuleInputSchema } from "@/contracts/content";
import { connectMongo } from "@/server/db/connect";
import { CapsuleModel, type UserDocument } from "@/server/db/models";

function mapCapsule(capsule: InstanceType<typeof CapsuleModel>) {
  return {
    id: capsule._id.toString(),
    alias: capsule.aliasSnapshot,
    body: capsule.body,
    topic: capsule.topic,
    mood: capsule.mood ?? undefined,
    visibility: capsule.visibility,
    unlockAt: capsule.unlockAt.toISOString(),
    status: capsule.status as "sealed" | "unlocked" | "published",
  };
}

export async function listCapsules(user: UserDocument) {
  await connectMongo();
  const now = new Date();
  await CapsuleModel.updateMany(
    {
      authorId: user._id,
      status: "sealed",
      unlockAt: { $lte: now },
    },
    { $set: { status: "unlocked", unlockedAt: now } },
  );
  const capsules = await CapsuleModel.find({
    authorId: user._id,
    status: { $ne: "deleted" },
  }).sort({ unlockAt: 1 });
  return capsules.map(mapCapsule);
}

export async function createCapsule(
  user: UserDocument,
  input: z.infer<typeof createCapsuleInputSchema>,
) {
  await connectMongo();
  const capsule = await CapsuleModel.create({
    authorId: user._id,
    aliasSnapshot: user.alias,
    body: input.body,
    topic: input.topic,
    mood: input.mood,
    visibility: input.visibility,
    unlockAt: input.unlockAt,
  });
  return mapCapsule(capsule);
}
