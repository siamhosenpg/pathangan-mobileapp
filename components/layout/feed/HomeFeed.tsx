import FeedList, {
  type FeedRefreshResult,
} from "@/components/ui/feed/FeedList";
import { postApi, useGetPostsInfiniteQuery } from "@/redux/api/postApi";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

interface HomeFeedProps {
  onScroll?: (scrollY: number) => void;
  // "সর্বশেষ" tab লুকানো থাকলে false
  isActive?: boolean;
  // Header + Tabs bar-এর উচ্চতা, list-এর উপরে এই পরিমাণ ফাঁকা থাকবে
  topInset?: number;
}

// hook আর updateQueryData দুটোই একই arg ব্যবহার করবে
const QUERY_ARGS = { limit: 10 };

export default function HomeFeed({
  onScroll,
  isActive = true,
  topInset = 0,
}: HomeFeedProps) {
  const dispatch = useDispatch<any>();

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
  } = useGetPostsInfiniteQuery(QUERY_ARGS);

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  );

  const refresh = useCallback(async (): Promise<FeedRefreshResult> => {
    // refetch fail করলে ফেরত দেওয়ার জন্য আগে থেকে snapshot রাখি
    const snapshot = data
      ? { pages: data.pages, pageParams: data.pageParams }
      : null;

    // cache-এ শুধু প্রথম page রাখো, তাহলে refetch-এ ১টা request যাবে
    dispatch(
      postApi.util.updateQueryData("getPosts", QUERY_ARGS, (draft) => {
        draft.pages = draft.pages.slice(0, 1);
        draft.pageParams = draft.pageParams.slice(0, 1);
      }),
    );

    const result = await refetch();

    if (result.isError) {
      if (snapshot) {
        // refetch fail -> আগে যে post গুলো ছিল সেগুলো ফেরত দিই
        dispatch(
          postApi.util.updateQueryData("getPosts", QUERY_ARGS, (draft) => {
            draft.pages = snapshot.pages;
            draft.pageParams = snapshot.pageParams;
          }),
        );
      }
      return { failed: true, error: result.error };
    }

    return { failed: false };
  }, [data, dispatch, refetch]);

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
      onScroll={onScroll}
      isActive={isActive}
      topInset={topInset}
    />
  );
}
