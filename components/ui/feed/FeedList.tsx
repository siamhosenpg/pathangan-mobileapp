import ErrorState from "@/components/error/ErrorState";
import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";
import UploadProgressBar from "@/components/ui/upload/UploadProgressBar";
import usePostViewTracker from "@/hooks/viewcount/usePostViewTracker";
import type { Post } from "@/types/postTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import NetInfo from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState, type ReactElement } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// wrapper (HomeFeed / ForYouFeed) নিজের cache অনুযায়ী refresh করে এই ফল ফেরত দেয়
export interface FeedRefreshResult {
  failed: boolean;
  error?: unknown;
}

interface FeedListProps {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => unknown;
  // পুরো পর্দার error-এ "আবার চেষ্টা"
  onRetry: () => unknown;
  // pull-to-refresh: cache ছেঁটে refetch করার কাজ wrapper-এর
  refresh: () => Promise<FeedRefreshResult>;
  onScroll?: (scrollY: number) => void;
  // header-এ বাড়তি কিছু (যেমন বিষয় বাছাইয়ের কার্ড)
  headerExtra?: ReactElement | null;
  emptyText?: string;
  // tab লুকানো থাকলে false: ভিডিও থামে, view timer বন্ধ হয়
  isActive?: boolean;
}

const ItemSeparator = () => <View style={{ height: 0 }} />;

export default function FeedList({
  posts,
  isLoading,
  isError,
  error,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  fetchNextPage,
  onRetry,
  refresh,
  onScroll,
  headerExtra,
  emptyText = "কোনো পোস্ট নেই",
  isActive = true,
}: FeedListProps) {
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastVisibleIndexRef = useRef<number | null>(null);

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // ── View tracker hook ──
  const { onViewableItemsChanged: trackViews, clearAllTimers } =
    usePostViewTracker();

  // ── Tab/screen change এ timers clear করো ──
  // isActive false হলে cleanup চলে (ভিডিও থামে), true হলে আবার চালু
  useFocusEffect(
    useCallback(() => {
      if (!isActive) return;
      setVisibleIndex(lastVisibleIndexRef.current);
      return () => {
        setVisibleIndex(null);
        clearAllTimers();
      };
    }, [isActive, clearAllTimers]),
  );

  // ── Pull to refresh ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    // net na thakle cache kate felbo na, purono post gulo thakbe
    // (upore NetworkBanner already offline dekhacche)
    const net = await NetInfo.fetch();
    if (net.isConnected === false || net.isInternetReachable === false) {
      return;
    }

    setIsRefreshing(true);

    try {
      clearAllTimers();
      lastVisibleIndexRef.current = null;
      setVisibleIndex(null);

      const result = await refresh();

      if (result.failed) {
        Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(result.error));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, clearAllTimers, refresh]);

  const handleEndReached = useCallback(() => {
    // next page er error thakle nije nije abar chalabo na,
    // user "আবার চেষ্টা করো" chaple tokhon chalbe
    if (isFetchNextPageError) return;
    if (hasNextPage && !isFetchingNextPage && !isRefreshing) fetchNextPage();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefreshing,
    fetchNextPage,
  ]);

  // ── Existing + view tracker একসাথে ──
  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      // লুকানো tab থেকে কিছু গোনা হবে না
      if (!isActiveRef.current) return;

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
    // 1) next page ashchhe -> skeleton
    if (isFetchingNextPage) {
      return (
        <View className="">
          <PostCardSkeleton />
        </View>
      );
    }

    // 2) next page fail -> purono post thakbe, niche shudhu chhoto retry
    if (isFetchNextPageError) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-text-secondary dark:text-dark-text-secondary text-sm text-center">
            আরও পোস্ট লোড করা যায়নি
          </Text>
          <TouchableOpacity
            onPress={() => fetchNextPage()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              আবার চেষ্টা করো
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 3) sob post shesh
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
  }, [
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    posts.length,
    fetchNextPage,
  ]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  // শুধু তখনই full-screen error, যখন দেখানোর মতো একটা post-ও নেই
  if (isError && posts.length === 0) {
    return (
      <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
        <ErrorState message={getErrorMessage(error)} onRetry={onRetry} />
      </View>
    );
  }

  // ✅ Refresh loader — list-এর header-এর ভেতরে, তাই post-এর সাথে scroll করবে
  const refreshLoader = isRefreshing ? (
    Platform.OS === "ios" ? (
      // iOS: pull করলে ওপরে যে ফাঁকা জায়গা তৈরি হয়, loader সেই জায়গায় বসে
      <View style={{ height: 0 }} pointerEvents="none">
        <View style={{ position: "absolute", top: -64, left: 0, right: 0 }}>
          <PullRefreshLoader />
        </View>
      </View>
    ) : (
      // Android: list-এর ওপরে নিজের জায়গা নিয়ে বসে, post একটু নিচে নামে
      <PullRefreshLoader />
    )
  ) : null;

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
          {refreshLoader}
          <UploadProgressBar />
          {headerExtra}
        </View>
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <View className="py-10 items-center">
          <Text className="text-gray-500 dark:text-dark-text text-sm text-center px-6">
            {emptyText}
          </Text>
        </View>
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10 }}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        // default spinner লুকানো, gesture আগের মতোই কাজ করবে
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["transparent"]} // Android spinner লুকানো
          progressBackgroundColor="transparent" // Android spinner-এর গোল background লুকানো
          tintColor="transparent" // iOS spinner লুকানো
        />
      }
    />
  );
}
