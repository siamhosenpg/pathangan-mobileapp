import {
  useLazyGetFollowersQuery,
  useLazyGetFollowingQuery,
} from "@/redux/api/followApi";
import type { FollowUser } from "@/types/followTypes";
import { useCallback, useEffect, useRef, useState } from "react";

export type FollowListType = "followers" | "following";

const PAGE_SIZE = 20;

export interface FollowListEntry {
  followId: string;
  user: FollowUser;
}

export const useFollowList = (type: FollowListType, userId: string) => {
  const [triggerFollowers] = useLazyGetFollowersQuery();
  const [triggerFollowing] = useLazyGetFollowingQuery();

  const [items, setItems] = useState<FollowListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true); // first load
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  // ref use kora hoyeche jate onEndReached bar bar fire hole double request na jay
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (reset: boolean) => {
      if (loadingRef.current) return;
      if (!reset && !hasMoreRef.current) return;

      loadingRef.current = true;
      setIsError(false);

      if (reset) {
        cursorRef.current = null;
        hasMoreRef.current = true;
      } else {
        setIsFetchingMore(true);
      }

      try {
        const arg = {
          userId,
          limit: PAGE_SIZE,
          cursor: cursorRef.current ?? undefined,
        };

        let entries: FollowListEntry[] = [];
        let nextCursor: string | null = null;
        let hasMore = false;

        if (type === "followers") {
          const res = await triggerFollowers(arg).unwrap();
          entries = res.followers.map((f) => ({
            followId: f._id,
            user: f.followerId,
          }));
          nextCursor = res.nextCursor;
          hasMore = res.hasMore;
        } else {
          const res = await triggerFollowing(arg).unwrap();
          entries = res.following.map((f) => ({
            followId: f._id,
            user: f.followingId,
          }));
          nextCursor = res.nextCursor;
          hasMore = res.hasMore;
        }

        cursorRef.current = nextCursor;
        hasMoreRef.current = hasMore;

        setItems((prev) => {
          if (reset) return entries;
          // duplicate ekdom ew ashbe na, tobuo safety-r jonno dedupe
          const seen = new Set(prev.map((p) => p.followId));
          return [...prev, ...entries.filter((e) => !seen.has(e.followId))];
        });
      } catch (err) {
        console.error("Follow list error:", err);
        setIsError(true);
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
        setIsFetchingMore(false);
        setIsRefreshing(false);
      }
    },
    [type, userId, triggerFollowers, triggerFollowing],
  );

  // first load (ar type/userId change hole abar)
  useEffect(() => {
    setItems([]);
    setIsLoading(true);
    loadPage(true);
  }, [loadPage]);

  const loadMore = useCallback(() => loadPage(false), [loadPage]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    loadPage(true);
  }, [loadPage]);

  return {
    items,
    isLoading,
    isFetchingMore,
    isRefreshing,
    isError,
    loadMore,
    refresh,
  };
};
