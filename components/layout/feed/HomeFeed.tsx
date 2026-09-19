import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import UploadProgressBar from "@/components/ui/upload/UploadProgressBar";
import usePostViewTracker from "@/hooks/viewcount/usePostViewTracker";
import { postApi, useGetPostsInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { useDispatch } from "react-redux";

interface HomeFeedProps {
  onScroll?: (scrollY: number) => void;
}

// hook r updateQueryData duitai same arg use korbe
const QUERY_ARGS = { limit: 10 };

const ItemSeparator = () => <View style={{ height: 0 }} />;

const ListEmpty = () => (
  <View className="py-10 items-center">
    <Text className="text-gray-500 dark:text-dark-text text-sm">
      কোনো পোস্ট নেই
    </Text>
  </View>
);

export default function HomeFeed({ onScroll }: HomeFeedProps) {
  const dispatch = useDispatch<any>();

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetPostsInfiniteQuery(QUERY_ARGS);

  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastVisibleIndexRef = useRef<number | null>(null);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // ── View tracker hook ──
  const { onViewableItemsChanged: trackViews, clearAllTimers } =
    usePostViewTracker();

  // ── Tab change এ timers clear করো ──
  useFocusEffect(
    useCallback(() => {
      setVisibleIndex(lastVisibleIndexRef.current);
      return () => {
        setVisibleIndex(null);
        clearAllTimers(); // ← tab থেকে চলে গেলে pending timers clear
      };
    }, [clearAllTimers]),
  );

  // ── Pull to refresh ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      clearAllTimers();
      lastVisibleIndexRef.current = null;
      setVisibleIndex(null);

      // cache e shudhu prothom page rakho, tahole refetch e 1ta request jabe
      dispatch(
        postApi.util.updateQueryData("getPosts", QUERY_ARGS, (draft) => {
          draft.pages = draft.pages.slice(0, 1);
          draft.pageParams = draft.pageParams.slice(0, 1);
        }),
      );

      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, clearAllTimers, dispatch, refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefreshing) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isRefreshing, fetchNextPage]);

  // ── Existing + view tracker একসাথে ──
  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      // Existing video visibility logic
      const visible = info.viewableItems.find((v: any) => v.isViewable);
      const index = visible?.index ?? null;
      lastVisibleIndexRef.current = index;
      setVisibleIndex(index);

      // View tracker — image/text post এর 3 সেকেন্ড timer
      trackViews(info);
    },
    [trackViews],
  );

  const renderItem = useCallback(
    ({ item: post, index }: { item: Post; index: number }) => {
      if (!post) return null;
      if (post.postType === "question") return <QuestionCard post={post} />;
      if (post.postType === "course") return <CourseCardFeed post={post} />;

      const isVideoVisible = visibleIndex === index;
      const isNearVisible =
        visibleIndex !== null && Math.abs(index - visibleIndex) <= 3; // ±2

      return (
        <Postcard
          post={post}
          isVideoVisible={isVideoVisible}
          isVideoNearVisible={isNearVisible}
        />
      );
    },
    [visibleIndex],
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="">
          <PostCardSkeleton />
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-gray-500 dark:text-dark-text text-sm">
            আর কোনো পোস্ট নেই
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, posts.length]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 dark:bg-dark-background-secondary">
        <Text className="text-gray-400 dark:text-dark-text text-sm">
          পোস্ট লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      onScroll={(e) => onScroll?.(Math.max(0, e.nativeEvent.contentOffset.y))}
      scrollEventThrottle={16}
      onViewableItemsChanged={handleViewableItemsChanged}
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      ListHeaderComponent={
        <View className="">
          <UploadProgressBar />
        </View>
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={ListEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10 }}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["#00914d"]} // Android spinner color
          tintColor="#00914d" // iOS spinner color
        />
      }
    />
  );
}
