import { FeedView } from "@/features/feed/components/feed-view";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string | string[] }>;
}) {
  const params = await searchParams;
  const authError = Array.isArray(params.auth) ? params.auth[0] : params.auth;
  return <FeedView authError={authError} />;
}
