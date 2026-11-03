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
}

// hook r updateQueryData duitai same arg use korbe
const QUERY_ARGS = { limit: 10 };

export default function HomeFeed({ onScroll, isActive = true }: HomeFeedProps) {
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
    // refetch fail korle ferot dewar jonno age theke snapshot rakhi
    const snapshot = data
      ? { pages: data.pages, pageParams: data.pageParams }
      : null;

    // cache e shudhu prothom page rakho, tahole refetch e 1ta request jabe
    dispatch(
      postApi.util.updateQueryData("getPosts", QUERY_ARGS, (draft) => {
        draft.pages = draft.pages.slice(0, 1);
        draft.pageParams = draft.pageParams.slice(0, 1);
      }),
    );

    const result = await refetch();

    if (result.isError) {
      if (snapshot) {
        // refetch fail -> agey je post gulo chilo segulo ferot dei
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
    />
  );
}
