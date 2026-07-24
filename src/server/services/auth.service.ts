import { createHash } from "crypto";
import { z } from "zod";
import { connectMongo } from "@/server/db/connect";
import { UserModel } from "@/server/db/models";

export const googleUserInfoSchema = z.strictObject({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean().optional(),
  name: z.string().max(120).optional(),
  picture: z.url().optional(),
});

const aliasAdjectives = ["quiet", "paper", "soft", "north", "golden"];
const aliasNouns = ["comet", "moon", "thunder", "window", "static"];
const aliases = aliasAdjectives.flatMap((adjective) =>
  aliasNouns.map((noun) => `${adjective} ${noun}`),
);

function aliasFromEmail(email: string) {
  const hash = createHash("sha256").update(email.toLowerCase()).digest();
  return `${aliasAdjectives[hash[0] % aliasAdjectives.length]} ${
    aliasNouns[hash[1] % aliasNouns.length]
  }`;
}

export async function upsertGoogleUser(
  input: z.infer<typeof googleUserInfoSchema>,
) {
  await connectMongo();
  const email = input.email.toLowerCase();

  return UserModel.findOneAndUpdate(
    { googleAccountId: input.sub },
    {
      $set: {
        email,
        emailVerified: input.email_verified ?? true,
        name: input.name,
        imageUrl: input.picture,
        status: "active",
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        googleAccountId: input.sub,
        alias: aliasFromEmail(email),
        aliasChangedAt: new Date(),
        role: "user",
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

export async function rotateUserAlias(userId: string, currentAlias: string) {
  await connectMongo();
  const currentIndex = aliases.indexOf(currentAlias);
  const alias = aliases[(currentIndex + 1 + aliases.length) % aliases.length];
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { alias, aliasChangedAt: new Date() } },
    { new: true },
  );
}
