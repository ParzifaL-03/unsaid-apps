import type { AnonymousPost } from "@/types/post";

export const seedPosts: AnonymousPost[] = [
  {
    id: "quiet-comet",
    alias: "quiet comet",
    body: "I keep writing messages I never send. Maybe silence feels safer, but it is getting heavier every day.",
    topic: "relationships",
    mood: "heavy",
    createdAt: "2m ago",
    echoes: 248,
    replies: 36,
  },
  {
    id: "paper-moon",
    alias: "paper moon",
    body: "Sometimes I miss the version of me that believed every friendship would last forever.",
    topic: "starting-over",
    mood: "nostalgic",
    createdAt: "11m ago",
    echoes: 184,
    replies: 21,
  },
  {
    id: "soft-thunder",
    alias: "soft thunder",
    body: "I got the job. I have not told anyone yet because I am scared that saying it out loud will make it disappear.",
    topic: "quiet-victories",
    mood: "hopeful",
    createdAt: "26m ago",
    echoes: 329,
    replies: 48,
  },
];
