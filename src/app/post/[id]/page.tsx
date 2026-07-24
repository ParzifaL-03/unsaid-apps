import type { Metadata } from "next";
import { PostDetail } from "@/features/post/components/post-detail";

export const metadata: Metadata = {
  title: "Anonymous expression",
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetail id={id} />;
}
