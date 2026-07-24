export type Mood = "heavy" | "hopeful" | "nostalgic" | "quiet";

export type AnonymousPost = {
  id: string;
  alias: string;
  body: string;
  topic: string;
  mood: Mood;
  createdAt: string;
  echoes: number;
  replies: number;
};
