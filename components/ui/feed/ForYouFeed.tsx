import FeedList, {
  type FeedRefreshResult,
} from "@/components/ui/feed/FeedList";

import {
  FEED_QUERY_ARGS,
  feedApi,
  useGetForYouFeedInfiniteQuery,
} from "@/redux/api/feedApi";
import type { Post } from "@/types/postTypes";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import InterestPromptCard from "./InterestPromptCard";

interface ForYouFeedProps {
  onScroll?: (scrollY: number) => void;
  // "আপনার জন্য" tab লুকানো থাকলে false
  isActive?: boolean;
}

export default function ForYouFeed({
  onScroll,
  isActive = true,
}: ForYouFeedProps) {
  const { t } = useTranslation();
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
  } = useGetForYouFeedInfiniteQuery(FEED_QUERY_ARGS, {
    // net ফিরলে ফিড নিজে থেকে নতুন করে সাজাবে না
    refetchOnReconnect: false,
  });

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

  // cache-এ শুধু প্রথম page রেখে refetch: সার্ভার cursor ছাড়া request পেয়ে নতুন ফিড বানায়
  const refresh = useCallback(async (): Promise<FeedRefreshResult> => {
    const snapshot = data
      ? { pages: data.pages, pageParams: data.pageParams }
      : null;

    dispatch(
      feedApi.util.updateQueryData(
        "getForYouFeed",
        FEED_QUERY_ARGS,
        (draft) => {
          draft.pages = draft.pages.slice(0, 1);
          draft.pageParams = draft.pageParams.slice(0, 1);
        },
      ),
    );

    const result = await refetch();

    if (result.isError) {
      if (snapshot) {
        dispatch(
          feedApi.util.updateQueryData(
            "getForYouFeed",
            FEED_QUERY_ARGS,
            (draft) => {
              draft.pages = snapshot.pages;
              draft.pageParams = snapshot.pageParams;
            },
          ),
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
      headerExtra={<InterestPromptCard />}
      emptyText={t("feedData.emptyFeed")}
      isActive={isActive}
    />
  );
}
