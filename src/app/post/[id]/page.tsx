"use client";

import { useParams } from "next/navigation";
import { PostDetail } from "@/features/post/components/post-detail";

export default function PostPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <PostDetail id={id} />;
}
