import { createHash } from "crypto";
import { ensureMongoReady } from "@/lib/mongo/bootstrap";
import { UserModel } from "@/lib/mongo/models";

type GoogleUserInput = {
  email: string;
  emailVerified: boolean;
  providerAccountId: string;
  alias: string;
  name?: string;
  image?: string;
};

export async function upsertGoogleUser(input: GoogleUserInput) {
  await ensureMongoReady();

  return UserModel.findOneAndUpdate(
    { provider: "google", providerAccountId: input.providerAccountId },
    {
      $set: {
        email: input.email.toLowerCase(),
        emailVerified: input.emailVerified,
        alias: input.alias,
        name: input.name,
        image: input.image,
        status: "active",
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        provider: "google",
        role: "user",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

export async function findOrCreateSessionUser(input: {
  email: string;
  alias: string;
  name?: string;
  image?: string;
}) {
  await ensureMongoReady();

  const providerAccountId = createHash("sha256")
    .update(input.email.toLowerCase())
    .digest("hex");

  return UserModel.findOneAndUpdate(
    { email: input.email.toLowerCase() },
    {
      $set: {
        alias: input.alias,
        name: input.name,
        image: input.image,
        status: "active",
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        email: input.email.toLowerCase(),
        emailVerified: true,
        provider: "google",
        providerAccountId,
        role: "user",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}
