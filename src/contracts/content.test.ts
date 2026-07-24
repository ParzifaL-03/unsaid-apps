import assert from "node:assert/strict";
import test from "node:test";
import {
  createCapsuleInputSchema,
  createOpenLetterInputSchema,
  createPostInputSchema,
} from "@/contracts/content";

test("create post normalizes topic and rejects unknown fields", () => {
  const valid = createPostInputSchema.parse({
    body: "This is a valid anonymous expression.",
    topic: "#Starting-Over",
    mood: "hopeful",
  });
  assert.equal(valid.topic, "starting-over");

  const invalid = createPostInputSchema.safeParse({
    ...valid,
    authorId: "507f1f77bcf86cd799439011",
  });
  assert.equal(invalid.success, false);
});

test("open letter validates recipient email", () => {
  const result = createOpenLetterInputSchema.safeParse({
    recipientEmail: "not-an-email",
    recipientLabel: "old friend",
    subject: "Words I kept",
    body: "This message is long enough to be accepted.",
  });
  assert.equal(result.success, false);
});

test("capsule unlock date must be in the future", () => {
  const result = createCapsuleInputSchema.safeParse({
    body: "A message for another day.",
    topic: "future-me",
    visibility: "private",
    unlockAt: new Date(0).toISOString(),
  });
  assert.equal(result.success, false);
});
