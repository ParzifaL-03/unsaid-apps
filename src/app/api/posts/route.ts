import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth-session";
import { findOrCreateSessionUser } from "@/lib/mongo/auth-users";
import { ensureMongoReady } from "@/lib/mongo/bootstrap";
import { PostModel } from "@/lib/mongo/models";
import type { AnonymousPost, Mood } from "@/types/post";

export const runtime = "nodejs";

const moods = new Set<Mood>(["heavy", "hopeful", "nostalgic", "quiet"]);

type CreatePostBody = {
  body?: unknown;
  topic?: unknown;
  mood?: unknown;
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function formatCreatedAt(value: Date) {
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - value.getTime()) / 1000),
  );
  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function toAnonymousPost(post: {
  _id: unknown;
  alias: string;
  body: string;
  topic: string;
  mood: Mood;
  publishedAt: Date;
  echoes: number;
  replies: number;
}): AnonymousPost {
  return {
    id: String(post._id),
    alias: post.alias,
    body: post.body,
    topic: post.topic,
    mood: post.mood,
    createdAt: formatCreatedAt(post.publishedAt),
    echoes: post.echoes,
    replies: post.replies,
  };
}

export async function GET() {
  let posts;
  try {
    await ensureMongoReady();
    posts = await PostModel.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
  } catch {
    return jsonError("Unable to connect to the posts database.", 503);
  }

  return NextResponse.json({
    posts: posts.map((post) =>
      toAnonymousPost({
        _id: post._id,
        alias: post.alias,
        body: post.body,
        topic: post.topic,
        mood: post.mood,
        publishedAt: post.publishedAt,
        echoes: post.echoes,
        replies: post.replies,
      }),
    ),
  });
}

export async function POST(request: NextRequest) {
  const account = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!account) {
    return jsonError(
      "A Gmail session is required to publish anonymously.",
      401,
    );
  }

  let payload: CreatePostBody;
  try {
    payload = (await request.json()) as CreatePostBody;
  } catch {
    return jsonError("Invalid JSON payload.", 400);
  }

  const body = normalizeString(payload.body);
  const topic = normalizeString(payload.topic).replace(/^#/, "") || "unsaid";
  const mood = normalizeString(payload.mood);

  if (body.length < 12 || body.length > 1200) {
    return jsonError("Post body must be between 12 and 1200 characters.", 400);
  }

  if (topic.length > 60) {
    return jsonError("Topic must be 60 characters or fewer.", 400);
  }

  if (!moods.has(mood as Mood)) {
    return jsonError("Select a valid mood.", 400);
  }
  const moodValue = mood as Mood;

  let post;
  try {
    const userId =
      account.userId && Types.ObjectId.isValid(account.userId)
        ? new Types.ObjectId(account.userId)
        : (
            await findOrCreateSessionUser({
              email: account.email,
              alias: account.alias,
              name: account.name,
              image: account.image,
            })
          )._id;

    await ensureMongoReady();
    post = await PostModel.create({
      authorUserId: userId,
      alias: account.alias,
      body,
      topic,
      mood: moodValue,
      status: "published",
      publishedAt: new Date(),
      echoes: 0,
      replies: 0,
    });
  } catch {
    return jsonError("Unable to connect to the posts database.", 503);
  }

  return NextResponse.json(
    {
      post: toAnonymousPost({
        _id: post._id,
        alias: post.alias,
        body: post.body,
        topic: post.topic,
        mood: post.mood,
        publishedAt: post.publishedAt,
        echoes: post.echoes,
        replies: post.replies,
      }),
    },
    { status: 201 },
  );
}
