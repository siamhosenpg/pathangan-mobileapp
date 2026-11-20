import FeedList, {
  type FeedRefreshResult,
} from "@/components/ui/feed/FeedList";
import { useGetPostsByUserIdInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { useCallback, useMemo, useRef } from "react";

interface Props {
  userid: string;
  listHeader?: React.ReactElement;
  // উপরে টেনে নামালে parent এর data (যেমন profile) আবার আনার জন্য
  onRefresh?: () => Promise<unknown> | void;
}

export default function ProfilePosts({ userid, listHeader, onRefresh }: Props) {
  const {
    data,
    error,
    isLoading,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetPostsByUserIdInfiniteQuery(
    { userid, limit: 10 },
    { skip: !userid },
  );

  // একই post দুবার এলে (বিরল) একবারই দেখাবে
  const posts = useMemo(() => {
    const seen = new Set<string>();
    const list: Post[] = [];

    for (const page of data?.pages ?? []) {
      for (const post of page.posts) {
        if (!post || seen.has(post._id)) continue;
        seen.add(post._id);
        list.push(post);
      }
    }

    return list;
  }, [data]);

  const postsLengthRef = useRef(posts.length);
  postsLengthRef.current = posts.length;

  // posts + parent এর data (profile) একসাথে refresh
  // (নেট চেক, loader আর error alert FeedList নিজেই সামলায়)
  const refresh = useCallback(async (): Promise<FeedRefreshResult> => {
    try {
      const [postsResult] = await Promise.all([refetch(), onRefresh?.()]);

      // refresh fail হলেও পুরনো পোস্ট থাকবে, শুধু user কে জানানো হবে
      if (postsResult?.isError && postsLengthRef.current > 0) {
        return { failed: true, error: postsResult.error };
      }
    } catch (err) {
      if (postsLengthRef.current > 0) return { failed: true, error: err };
    }

    return { failed: false };
  }, [refetch, onRefresh]);

  return (
    <FeedList
      posts={posts}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetchingNextPage={isFetchingNextPage}
      isFetchNextPageError={isFetchNextPageError}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      onRetry={refetch}
      refresh={refresh}
      headerExtra={listHeader ?? null}
      emptyText="কোনো পোস্ট নেই"
      showUploadProgress={false}
      keepListOnEmpty
    />
  );
}
