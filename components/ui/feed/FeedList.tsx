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
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  Alert,
  Dimensions,
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
  // Header + Tabs bar-এর উচ্চতা: list-এর উপরে এই পরিমাণ ফাঁকা থাকবে
  topInset?: number;
}

const ItemSeparator = () => <View style={{ height: 0 }} />;

// স্ক্রিনের বাইরে কতটা আগে থেকে item render (mount) হবে
// ভিডিও আগে থেকে লোড করতে হলে আগে cell mount হতে হয়, তাই এটা বড় রাখা হয়েছে
const DRAW_DISTANCE = Dimensions.get("window").height * 2.5;

// সামনের কতগুলো আর পেছনের কতগুলো *ভিডিও পোস্ট* আগে থেকে লোড থাকবে
// (ছবি/টেক্সট পোস্ট গোনা হয় না)। কম দামের Android ফোনে একসাথে অনেক
// decoder চালু রাখা যায় না, তাই মোট ৪টার (১ + ২ + ১) বেশি করো না
const PRELOAD_AHEAD_VIDEOS = 2;
const PRELOAD_BEHIND_VIDEOS = 1;

// শেষ থেকে কতগুলো post বাকি থাকতে নতুন page আনা শুরু হবে
const LOAD_MORE_REMAINING = 5;

// minimumViewTime: 0 দিলে post স্ক্রিনে আসার সাথে সাথে callback আসে, ভিডিও দ্রুত চলে
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 60,
  minimumViewTime: 0,
};

// base    = কোন post-কে কেন্দ্র করে preload window বসবে
// playing = কোন post-এর ভিডিও এখন চলবে (নেই হলে null)
interface ViewState {
  base: number | null;
  playing: number | null;
}

const EMPTY_VIEW: ViewState = { base: null, playing: null };

const sameView = (a: ViewState, b: ViewState) =>
  a.base === b.base && a.playing === b.playing;

// Postcard যে শর্তে ভিডিও দেখায়, ঠিক সেই শর্ত
const isVideoPost = (post?: Post | null) => {
  if (!post) return false;
  if (post.postType === "question" || post.postType === "course") return false;
  const content = post.content as any;
  return (
    content?.type === "video" &&
    Array.isArray(content?.media) &&
    content.media.length > 0
  );
};

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
  topInset = 0,
}: FeedListProps) {
  const [view, setView] = useState<ViewState>(EMPTY_VIEW);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // tab/screen ফিরে এলে আগের অবস্থা ফেরানোর জন্য
  const lastViewRef = useRef<ViewState>(EMPTY_VIEW);

  const postsRef = useRef(posts);
  postsRef.current = posts;

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // ── View tracker hook ──
  const { onViewableItemsChanged: trackViews, clearAllTimers } =
    usePostViewTracker();

  const applyView = useCallback((next: ViewState) => {
    lastViewRef.current = next;
    setView((prev) => (sameView(prev, next) ? prev : next));
  }, []);

  // ── Tab/screen change এ timers clear করো ──
  // isActive false হলে cleanup চলে (ভিডিও থামে ও unload হয়), true হলে আগের অবস্থা ফেরে
  useFocusEffect(
    useCallback(() => {
      if (!isActive) return;
      setView(lastViewRef.current);
      return () => {
        setView(EMPTY_VIEW);
        clearAllTimers();
      };
    }, [isActive, clearAllTimers]),
  );

  // ── কোন কোন ভিডিও আগে থেকে লোড থাকবে ──
  const videoIndices = useMemo(() => {
    const list: number[] = [];
    posts.forEach((post, i) => {
      if (isVideoPost(post)) list.push(i);
    });
    return list;
  }, [posts]);

  const baseIndex = view.playing ?? view.base;

  const preloadSet = useMemo(() => {
    const set = new Set<number>();
    if (baseIndex === null) return set;

    // base-এর সমান বা পরের প্রথম ভিডিও কোনটা
    let pos = videoIndices.findIndex((i) => i >= baseIndex);
    if (pos === -1) pos = videoIndices.length;

    for (
      let p = pos - PRELOAD_BEHIND_VIDEOS;
      p <= pos + PRELOAD_AHEAD_VIDEOS;
      p++
    ) {
      const idx = videoIndices[p];
      if (idx !== undefined) set.add(idx);
    }
    return set;
  }, [videoIndices, baseIndex]);

  // ── Pull to refresh ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    // নেট না থাকলে cache কেটে ফেলব না, পুরনো post গুলো থাকবে
    // (উপরে NetworkBanner আগে থেকেই offline দেখাচ্ছে)
    const net = await NetInfo.fetch();
    if (net.isConnected === false || net.isInternetReachable === false) {
      return;
    }

    setIsRefreshing(true);

    try {
      clearAllTimers();
      lastViewRef.current = EMPTY_VIEW;
      setView(EMPTY_VIEW);

      const result = await refresh();

      if (result.failed) {
        Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(result.error));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, clearAllTimers, refresh]);

  // ── পরের page আনার একটাই জায়গা (দুই ট্রিগারই এটা ব্যবহার করে) ──
  const loadMoreIfNeeded = useCallback(() => {
    // next page-এর error থাকলে নিজে নিজে আবার চালাবে না,
    // user "আবার চেষ্টা করো" চাপলে তখন চলবে
    if (isFetchNextPageError) return;
    if (!hasNextPage || isFetchingNextPage || isRefreshing) return;
    fetchNextPage();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefreshing,
    fetchNextPage,
  ]);

  // ব্যাকআপ: ইউজার খুব দ্রুত স্ক্রল করে একদম শেষে চলে গেলে
  const handleEndReached = useCallback(() => {
    loadMoreIfNeeded();
  }, [loadMoreIfNeeded]);

  // ── ভিডিও visibility + আগে থেকে load + view tracker ──
  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      // লুকানো tab থেকে কিছু গোনা হবে না
      if (!isActiveRef.current) return;

      const list = postsRef.current;
      const viewable = (info.viewableItems ?? [])
        .filter((v: any) => v.isViewable && typeof v.index === "number")
        .sort((a: any, b: any) => a.index - b.index);

      if (viewable.length > 0) {
        const first: number = viewable[0].index;

        // দেখা যাচ্ছে এমন প্রথম *ভিডিও* পোস্টটাই চলবে (ছবি/টেক্সট বাদ)
        const playingToken = viewable.find((v: any) =>
          isVideoPost(list[v.index]),
        );
        const playing: number | null = playingToken ? playingToken.index : null;

        applyView({ base: playing ?? first, playing });

        // শেষ থেকে LOAD_MORE_REMAINING টা post বাকি থাকতেই পরের page আনো
        if (list.length - first <= LOAD_MORE_REMAINING) {
          loadMoreIfNeeded();
        }
      } else {
        // কোনো post ৬০% দেখা যাচ্ছে না (স্ক্রলের মাঝের মুহূর্ত):
        // চলা ভিডিও শুধু থামবে, কিন্তু player নষ্ট হবে না, তাই আবার সাথে সাথে চলবে
        applyView({ base: lastViewRef.current.base, playing: null });
      }

      // View tracker — image/text post এর 3 সেকেন্ড timer
      trackViews(info);
    },
    [applyView, loadMoreIfNeeded, trackViews],
  );

  // ভিডিও পোস্ট ভিডিও cell-এ, বাকিরা নিজেদের cell-এ recycle হবে
  const getItemType = useCallback((post: Post) => {
    if (post?.postType === "question") return "question";
    if (post?.postType === "course") return "course";
    return isVideoPost(post) ? "video" : "post";
  }, []);

  const renderItem = useCallback(
    ({ item: post, index }: { item: Post; index: number }) => {
      if (!post) return null;
      if (post.postType === "question") return <QuestionCard post={post} />;
      if (post.postType === "course") return <CourseCardFeed post={post} />;

      return (
        <Postcard
          post={post}
          isVideoVisible={view.playing === index}
          isVideoNearVisible={preloadSet.has(index)}
        />
      );
    },
    [view.playing, preloadSet],
  );

  const renderFooter = useCallback(() => {
    // 1) next page আসছে -> skeleton
    if (isFetchingNextPage) {
      return (
        <View className="">
          <PostCardSkeleton />
        </View>
      );
    }

    // 2) next page fail -> পুরনো post থাকবে, নিচে শুধু ছোট retry
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

    // 3) সব post শেষ
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

  // Loading: header-এর নিচে শুরু হবে
  if (isLoading) {
    return (
      <View
        className="flex-1 bg-background-secondary dark:bg-dark-background-secondary"
        style={{ paddingTop: topInset }}
      >
        <PostCardSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  // শুধু তখনই full-screen error, যখন দেখানোর মতো একটা post-ও নেই
  if (isError && posts.length === 0) {
    return (
      <View
        className="flex-1 bg-background-secondary dark:bg-dark-background-secondary"
        style={{ paddingTop: topInset }}
      >
        <ErrorState message={getErrorMessage(error)} onRetry={onRetry} />
      </View>
    );
  }

  // Refresh loader — list-এর header-এর ভেতরে, তাই post-এর সাথে scroll করবে
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
      // playing / preload window / post সংখ্যা বদলালে cell গুলো আবার render হবে
      extraData={`${view.playing}|${baseIndex}|${posts.length}`}
      keyExtractor={(item) => item._id}
      getItemType={getItemType}
      renderItem={renderItem}
      drawDistance={DRAW_DISTANCE}
      viewabilityConfig={VIEWABILITY_CONFIG}
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
      // এটা শুধু ব্যাকআপ, আসল ট্রিগার handleViewableItemsChanged-এ
      onEndReachedThreshold={1}
      showsVerticalScrollIndicator={false}
      // header (+ tabs) এর নিচ থেকে content শুরু হবে
      contentContainerStyle={{ paddingTop: topInset, paddingBottom: 10 }}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        // default spinner লুকানো, gesture আগের মতোই কাজ করবে
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["transparent"]} // Android spinner লুকানো
          progressBackgroundColor="transparent"
          tintColor="transparent" // iOS spinner লুকানো
          progressViewOffset={topInset}
        />
      }
    />
  );
}
