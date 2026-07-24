import {
  model,
  models,
  Schema,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { mongoCollectionNames } from "@/lib/mongo/schemas";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
      unique: true,
    },
    emailVerified: { type: Boolean, required: true, default: false },
    provider: { type: String, enum: ["google"], required: true },
    providerAccountId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    alias: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    name: { type: String, trim: true, maxlength: 120 },
    image: { type: String, trim: true, maxlength: 1000 },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      required: true,
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      required: true,
      default: "active",
    },
    lastLoginAt: { type: Date },
  },
  {
    collection: mongoCollectionNames.users,
    timestamps: true,
  },
);

userSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
userSchema.index({ status: 1, updatedAt: -1 });

const postSchema = new Schema(
  {
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    alias: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 12,
      maxlength: 1200,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 60,
    },
    mood: {
      type: String,
      enum: ["heavy", "hopeful", "nostalgic", "quiet"],
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "hidden", "deleted"],
      required: true,
      default: "published",
    },
    publishedAt: { type: Date, required: true, default: Date.now },
    echoes: { type: Number, required: true, min: 0, default: 0 },
    replies: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    collection: mongoCollectionNames.posts,
    timestamps: true,
  },
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ topic: 1, publishedAt: -1 });
postSchema.index({ authorUserId: 1, publishedAt: -1 });

export type UserModelDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export type PostModelDocument = InferSchemaType<typeof postSchema> & {
  _id: Types.ObjectId;
};

export const UserModel =
  (models.User as Model<UserModelDocument> | undefined) ??
  model<UserModelDocument>("User", userSchema);

export const PostModel =
  (models.Post as Model<PostModelDocument> | undefined) ??
  model<PostModelDocument>("Post", postSchema);
