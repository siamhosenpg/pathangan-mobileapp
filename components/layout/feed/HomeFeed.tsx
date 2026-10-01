import ErrorState from "@/components/error/ErrorState";
import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";

import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";
import UploadProgressBar from "@/components/ui/upload/UploadProgressBar";
import usePostViewTracker from "@/hooks/viewcount/usePostViewTracker";
import { postApi, useGetPostsInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { getErrorMessage } from "@/utils/getErrorMessage"; // path ঠিক করে নিও
import NetInfo from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    error,
    isLoading,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
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

    // net na thakle cache kate felbo na, purono post gulo thakbe
    // (upore NetworkBanner already offline dekhacche)
    const net = await NetInfo.fetch();
    if (net.isConnected === false || net.isInternetReachable === false) {
      return;
    }

    setIsRefreshing(true);

    // refetch fail korle ferot dewar jonno age theke snapshot rakhi
    const snapshot = data
      ? { pages: data.pages, pageParams: data.pageParams }
      : null;

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

      const result = await refetch();

      if (result.isError && snapshot) {
        // refetch fail -> agey je post gulo chilo segulo ferot dei
        dispatch(
          postApi.util.updateQueryData("getPosts", QUERY_ARGS, (draft) => {
            draft.pages = snapshot.pages;
            draft.pageParams = snapshot.pageParams;
          }),
        );
        Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(result.error));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, data, clearAllTimers, dispatch, refetch]);

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
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
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
