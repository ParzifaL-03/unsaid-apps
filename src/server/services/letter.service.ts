import { createHmac } from "crypto";
import type { z } from "zod";
import type { createOpenLetterInputSchema } from "@/contracts/content";
import { connectMongo } from "@/server/db/connect";
import { LetterModel, UserModel, type UserDocument } from "@/server/db/models";
import { getAuthSecretEnv } from "@/server/env";

function emailHash(email: string) {
  return createHmac("sha256", getAuthSecretEnv().AUTH_SECRET)
    .update(email.toLowerCase())
    .digest("hex");
}

function mapLetter(letter: InstanceType<typeof LetterModel>) {
  return {
    id: letter._id.toString(),
    recipientLabel: letter.recipientLabel,
    subject: letter.subject,
    body: letter.body,
    senderAlias: letter.aliasSnapshot,
    visibility: letter.visibility,
    createdAt: letter.sentAt.toISOString(),
  };
}

export async function listPublicLetters() {
  await connectMongo();
  const letters = await LetterModel.find({
    visibility: "public",
    status: { $in: ["sent", "read"] },
  })
    .sort({ sentAt: -1 })
    .limit(50);
  return letters.map(mapLetter);
}

export async function createLetter(
  user: UserDocument,
  input: z.infer<typeof createOpenLetterInputSchema>,
) {
  await connectMongo();
  const recipientEmail = input.recipientEmail.toLowerCase();
  const recipient = await UserModel.findOne({
    email: recipientEmail,
    status: "active",
  }).select("_id");

  const letter = await LetterModel.create({
    senderId: user._id,
    aliasSnapshot: user.alias,
    recipientUserId: recipient?._id,
    recipientEmailHash: emailHash(recipientEmail),
    recipientLabel: input.recipientLabel,
    subject: input.subject,
    body: input.body,
    visibility: input.visibility,
    sentAt: new Date(),
  });
  return mapLetter(letter);
}
