import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";
import usePostViewTracker from "@/hooks/viewcount/usePostViewTracker";
import { useGetPostsByUserIdInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  View,
} from "react-native";
import PostCardSkeleton from "../card/postcard/PostCardSkeleton";

// Android-এর ডিফল্ট spinner স্ক্রিনের উপরে বাইরে পাঠিয়ে লুকানোর জন্য
// (বড় negative মান দিলে বৃত্তটা কখনোই দেখা যায় না, কিন্তু টানার gesture ঠিকই কাজ করে)
const ANDROID_HIDDEN_SPINNER_OFFSET = -300;

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

const ItemSeparator = () => <View className="h-0" />;

interface Props {
  userid: string;
  listHeader?: React.ReactElement;
  // উপরে টেনে নামালে parent এর data (যেমন profile) আবার আনার জন্য
  onRefresh?: () => Promise<unknown> | void;
}

export default function ProfilePosts({ userid, listHeader, onRefresh }: Props) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetPostsByUserIdInfiniteQuery(
    { userid, limit: 10 },
    { skip: !userid },
  );

  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  // pull-to-refresh এর নিজস্ব state: user ছাড়লেই true, কাজ শেষে false
  const [refreshing, setRefreshing] = useState(false);

  // দুবার refresh চালু হওয়া আটকাতে (state-এর চেয়ে ref তাৎক্ষণিক)
  const isRefreshingRef = useRef(false);

  const lastVisibleIndexRef = useRef<number | null>(null);

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  );

  const postsLengthRef = useRef(posts.length);
  postsLengthRef.current = posts.length;

  const { onViewableItemsChanged: trackViews, clearAllTimers } =
    usePostViewTracker();

  useFocusEffect(
    useCallback(() => {
      setVisibleIndex(lastVisibleIndexRef.current);
      return () => {
        setVisibleIndex(null);
        clearAllTimers();
      };
    }, [clearAllTimers]),
  );

  const handleEndReached = useCallback(() => {
    // refresh cholar somoy notun page anbo na
    if (isRefreshingRef.current) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Pull to refresh: posts + parent এর data একসাথে ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    // ছাড়ার সাথে সাথেই আমাদের loader চালু, যাতে ডিফল্ট spinner-এর
    // জন্য কোনো ফাঁকা সময় না থাকে
    isRefreshingRef.current = true;
    setRefreshing(true);

    try {
      // নেট না থাকলে refetch চালাবে না, পুরনো data থাকবে
      // (finally-তে loader বন্ধ হবে)
      const net = await NetInfo.fetch();
      if (net.isConnected === false || net.isInternetReachable === false) {
        return;
      }

      const [postsResult] = await Promise.all([refetch(), onRefresh?.()]);

      // refresh fail হলেও পুরনো পোস্ট থাকবে, শুধু user কে জানাই
      if (postsResult?.isError && postsLengthRef.current > 0) {
        Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(postsResult.error));
      }
    } catch {
      // error হলে আগের data-ই থাকবে
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  }, [refetch, onRefresh]);

  // FlatList নিজেই scroll করছে তাই onViewableItemsChanged কাজ করবে
  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      const visible = info.viewableItems.find((v: any) => v.isViewable);
      const index = visible?.index ?? null;
      lastVisibleIndexRef.current = index;
      setVisibleIndex(index);

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
        visibleIndex !== null && Math.abs(index - visibleIndex) <= 3;

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

  const renderFooter = () => {
    // refresh-এর সময় নিচে spinner দেখাবে না (উপরে আমাদের loader আছে)
    if (refreshing) return null;

    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#00914d" />
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-text-secondary text-sm">আর কোনো পোস্ট নেই</Text>
        </View>
      );
    }
    return null;
  };

  // loading / error / খালি — সব অবস্থায় FlatList থাকে, তাই refresh কাজ করে
  const renderEmpty = () => {
    if (isLoading) return <PostCardSkeleton />;

    if (isError) {
      return (
        <View className="py-10 items-center">
          <Text className="text-text-secondary text-sm">
            পোস্ট লোড করতে সমস্যা হয়েছে
          </Text>
        </View>
      );
    }

    return (
      <View className="py-10 items-center">
        <Text className="text-text-secondary text-sm">কোনো পোস্ট নেই</Text>
      </View>
    );
  };

  // Refresh loader — list-এর header-এর ভেতরে, তাই profile-এর সাথে scroll করবে
  const refreshLoader = refreshing ? (
    Platform.OS === "ios" ? (
      // iOS: pull করলে ওপরে যে ফাঁকা জায়গা তৈরি হয়, loader সেই জায়গায় বসে
      <View style={{ height: 0 }} pointerEvents="none">
        <View style={{ position: "absolute", top: -64, left: 0, right: 0 }}>
          <PullRefreshLoader />
        </View>
      </View>
    ) : (
      // Android: list-এর ওপরে নিজের জায়গা নিয়ে বসে, profile একটু নিচে নামে
      <PullRefreshLoader />
    )
  ) : null;

  // ফাংশন না, element হিসেবে দেওয়া হয়েছে: তাহলে loader চালু/বন্ধ হলে
  // profile header আবার mount হয় না
  const header = (
    <View>
      {refreshLoader}
      {listHeader}
    </View>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={VIEWABILITY_CONFIG}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10 }}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        // ডিফল্ট spinner পুরো লুকানো, gesture আগের মতোই কাজ করবে
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["transparent"]} // Android spinner-এর রঙ লুকানো
          progressBackgroundColor="transparent" // Android বৃত্তের পটভূমি লুকানো
          tintColor="transparent" // iOS spinner লুকানো
          // Android: বৃত্ত + shadow স্ক্রিনের বাইরে পাঠানো (শুধু transparent যথেষ্ট না)
          progressViewOffset={
            Platform.OS === "android" ? ANDROID_HIDDEN_SPINNER_OFFSET : 0
          }
        />
      }
    />
  );
}
