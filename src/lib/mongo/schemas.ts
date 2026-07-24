export const mongoCollectionNames = {
  users: "users",
  openLetters: "open_letters",
  posts: "posts",
  postReactions: "post_reactions",
  reports: "reports",
  blocks: "blocks",
  capsules: "capsules",
  drafts: "drafts",
} as const;

export type MongoCollectionName =
  (typeof mongoCollectionNames)[keyof typeof mongoCollectionNames];

export type MongoDocumentBase = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = MongoDocumentBase & {
  email: string;
  emailVerified: boolean;
  provider: "google";
  providerAccountId: string;
  alias: string;
  name?: string;
  image?: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "suspended" | "deleted";
  lastLoginAt?: Date;
};

export type OpenLetterDocument = MongoDocumentBase & {
  recipientEmail: string;
  recipientLabel: string;
  subject: string;
  body: string;
  senderUserId: string;
  senderAlias: string;
  status: "sent" | "hidden" | "deleted";
  sentAt: Date;
  readAt?: Date;
};

export type PostMood = "heavy" | "hopeful" | "nostalgic" | "quiet";

export type PostDocument = MongoDocumentBase & {
  authorUserId: string;
  alias: string;
  body: string;
  topic: string;
  mood: PostMood;
  status: "published" | "hidden" | "deleted";
  publishedAt: Date;
  echoes: number;
  replies: number;
};

export type PostReactionDocument = MongoDocumentBase & {
  postId: string;
  userId: string;
  type: "echo";
};

export type ReportDocument = MongoDocumentBase & {
  targetType: "post" | "open_letter";
  targetId: string;
  reporterUserId: string;
  reason: "harassment" | "hate" | "self_harm" | "privacy" | "spam" | "other";
  note?: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
};

export type BlockDocument = MongoDocumentBase & {
  blockerUserId: string;
  blockedUserId: string;
  reason?: string;
};

export type CapsuleDocument = MongoDocumentBase & {
  authorUserId: string;
  alias: string;
  body: string;
  topic: string;
  unlockAt: Date;
  status: "sealed" | "opened" | "deleted";
  openedAt?: Date;
};

export type DraftDocument = MongoDocumentBase & {
  authorUserId: string;
  kind: "post" | "open_letter" | "capsule";
  payload: Record<string, unknown>;
};

const timestamps = {
  createdAt: { bsonType: "date" },
  updatedAt: { bsonType: "date" },
};

const requiredTimestamps = ["createdAt", "updatedAt"];

export const mongoJsonSchemas = {
  users: {
    bsonType: "object",
    required: [
      "email",
      "emailVerified",
      "provider",
      "providerAccountId",
      "alias",
      "role",
      "status",
      ...requiredTimestamps,
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      email: { bsonType: "string", minLength: 3, maxLength: 254 },
      emailVerified: { bsonType: "bool" },
      provider: { enum: ["google"] },
      providerAccountId: { bsonType: "string", minLength: 1, maxLength: 160 },
      alias: { bsonType: "string", minLength: 3, maxLength: 80 },
      name: { bsonType: "string", maxLength: 120 },
      image: { bsonType: "string", maxLength: 1000 },
      role: { enum: ["user", "moderator", "admin"] },
      status: { enum: ["active", "suspended", "deleted"] },
      lastLoginAt: { bsonType: "date" },
      ...timestamps,
    },
  },
  openLetters: {
    bsonType: "object",
    required: [
      "recipientEmail",
      "recipientLabel",
      "subject",
      "body",
      "senderUserId",
      "senderAlias",
      "status",
      "sentAt",
      ...requiredTimestamps,
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      recipientEmail: { bsonType: "string", minLength: 3, maxLength: 254 },
      recipientLabel: { bsonType: "string", minLength: 1, maxLength: 80 },
      subject: { bsonType: "string", minLength: 4, maxLength: 80 },
      body: { bsonType: "string", minLength: 20, maxLength: 2000 },
      senderUserId: { bsonType: "objectId" },
      senderAlias: { bsonType: "string", minLength: 3, maxLength: 80 },
      status: { enum: ["sent", "hidden", "deleted"] },
      sentAt: { bsonType: "date" },
      readAt: { bsonType: "date" },
      ...timestamps,
    },
  },
  posts: {
    bsonType: "object",
    required: [
      "authorUserId",
      "alias",
      "body",
      "topic",
      "mood",
      "status",
      "publishedAt",
      "echoes",
      "replies",
      ...requiredTimestamps,
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      authorUserId: { bsonType: "objectId" },
      alias: { bsonType: "string", minLength: 3, maxLength: 80 },
      body: { bsonType: "string", minLength: 12, maxLength: 1200 },
      topic: { bsonType: "string", minLength: 1, maxLength: 60 },
      mood: { enum: ["heavy", "hopeful", "nostalgic", "quiet"] },
      status: { enum: ["published", "hidden", "deleted"] },
      publishedAt: { bsonType: "date" },
      echoes: { bsonType: "int", minimum: 0 },
      replies: { bsonType: "int", minimum: 0 },
      ...timestamps,
    },
  },
  postReactions: {
    bsonType: "object",
    required: ["postId", "userId", "type", ...requiredTimestamps],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      postId: { bsonType: "objectId" },
      userId: { bsonType: "objectId" },
      type: { enum: ["echo"] },
      ...timestamps,
    },
  },
  reports: {
    bsonType: "object",
    required: [
      "targetType",
      "targetId",
      "reporterUserId",
      "reason",
      "status",
      ...requiredTimestamps,
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      targetType: { enum: ["post", "open_letter"] },
      targetId: { bsonType: "objectId" },
      reporterUserId: { bsonType: "objectId" },
      reason: {
        enum: ["harassment", "hate", "self_harm", "privacy", "spam", "other"],
      },
      note: { bsonType: "string", maxLength: 800 },
      status: { enum: ["open", "reviewing", "resolved", "dismissed"] },
      ...timestamps,
    },
  },
  blocks: {
    bsonType: "object",
    required: ["blockerUserId", "blockedUserId", ...requiredTimestamps],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      blockerUserId: { bsonType: "objectId" },
      blockedUserId: { bsonType: "objectId" },
      reason: { bsonType: "string", maxLength: 240 },
      ...timestamps,
    },
  },
  capsules: {
    bsonType: "object",
    required: [
      "authorUserId",
      "alias",
      "body",
      "topic",
      "unlockAt",
      "status",
      ...requiredTimestamps,
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      authorUserId: { bsonType: "objectId" },
      alias: { bsonType: "string", minLength: 3, maxLength: 80 },
      body: { bsonType: "string", minLength: 12, maxLength: 2000 },
      topic: { bsonType: "string", minLength: 1, maxLength: 60 },
      unlockAt: { bsonType: "date" },
      status: { enum: ["sealed", "opened", "deleted"] },
      openedAt: { bsonType: "date" },
      ...timestamps,
    },
  },
  drafts: {
    bsonType: "object",
    required: ["authorUserId", "kind", "payload", ...requiredTimestamps],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      authorUserId: { bsonType: "objectId" },
      kind: { enum: ["post", "open_letter", "capsule"] },
      payload: { bsonType: "object" },
      ...timestamps,
    },
  },
} as const;

export const mongoIndexes = {
  users: [
    { key: { email: 1 }, unique: true },
    { key: { provider: 1, providerAccountId: 1 }, unique: true },
    { key: { status: 1, updatedAt: -1 } },
  ],
  openLetters: [
    { key: { recipientEmail: 1, sentAt: -1 } },
    { key: { senderUserId: 1, sentAt: -1 } },
    { key: { status: 1, sentAt: -1 } },
  ],
  posts: [
    { key: { status: 1, publishedAt: -1 } },
    { key: { topic: 1, publishedAt: -1 } },
    { key: { authorUserId: 1, publishedAt: -1 } },
  ],
  postReactions: [
    { key: { postId: 1, userId: 1, type: 1 }, unique: true },
    { key: { userId: 1, createdAt: -1 } },
  ],
  reports: [
    { key: { status: 1, createdAt: -1 } },
    { key: { targetType: 1, targetId: 1 } },
    { key: { reporterUserId: 1, createdAt: -1 } },
  ],
  blocks: [
    { key: { blockerUserId: 1, blockedUserId: 1 }, unique: true },
    { key: { blockedUserId: 1 } },
  ],
  capsules: [
    { key: { authorUserId: 1, unlockAt: 1 } },
    { key: { status: 1, unlockAt: 1 } },
  ],
  drafts: [
    { key: { authorUserId: 1, updatedAt: -1 } },
    { key: { authorUserId: 1, kind: 1 } },
  ],
} as const;
