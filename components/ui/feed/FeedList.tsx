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
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// wrapper (HomeFeed / ForYouFeed / ProfilePosts / SavedPostsList) নিজের cache অনুযায়ী refresh করে এই ফল ফেরত দেয়
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
  // header-এ বাড়তি কিছু (যেমন বিষয় বাছাইয়ের কার্ড, প্রোফাইল হেডার)
  headerExtra?: ReactElement | null;
  emptyText?: string;
  // tab লুকানো থাকলে false: ভিডিও থামে, view timer বন্ধ হয়
  isActive?: boolean;
  // Header + Tabs bar-এর উচ্চতা: list-এর উপরে এই পরিমাণ ফাঁকা থাকবে
  topInset?: number;
  // list-এর নিচে বাড়তি ফাঁকা (যেমন bottom tab-এর জন্য)
  bottomInset?: number;
  // আপলোড প্রগ্রেস বার দেখাবে কিনা (প্রোফাইলে false দিন)
  showUploadProgress?: boolean;
  // true হলে লোডিং/error এর সময়ও list থাকবে (header আর pull-to-refresh ঠিক থাকবে)
  keepListOnEmpty?: boolean;
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

// Android-এর ডিফল্ট spinner স্ক্রিনের উপরে বাইরে পাঠিয়ে লুকানোর জন্য
// (বড় negative মান দিলে বৃত্তটা কখনোই দেখা যায় না, কিন্তু টানার gesture ঠিকই কাজ করে)
const ANDROID_HIDDEN_SPINNER_OFFSET = -300;

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
  emptyText,
  isActive = true,
  topInset = 0,
  bottomInset = 10,
  showUploadProgress = true,
  keepListOnEmpty = false,
}: FeedListProps) {
  const { t } = useTranslation();

  const [view, setView] = useState<ViewState>(EMPTY_VIEW);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Screen focus ──
  // অন্য পেজ (যেমন post পেজ) এর উপরে গেলে এই feed focus হারায়।
  // তখন কোনো ভিডিও চলবে না, কিন্তু যেটা চলছিল সেটা pause অবস্থায় লোড থাকবে।
  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  // tab দেখা যাচ্ছে + screen focus এ আছে = সত্যিকারের "live"
  const isLive = isActive && focused;
  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;

  // দুবার refresh চালু হওয়া আটকাতে (state-এর চেয়ে ref তাৎক্ষণিক)
  const isRefreshingRef = useRef(false);

  // tab/screen ফিরে এলে আগের অবস্থা ফেরানোর জন্য
  const lastViewRef = useRef<ViewState>(EMPTY_VIEW);

  const postsRef = useRef(posts);
  postsRef.current = posts;

  // ── View tracker hook ──
  const { onViewableItemsChanged: trackViews, clearAllTimers } =
    usePostViewTracker();

  const applyView = useCallback((next: ViewState) => {
    lastViewRef.current = next;
    setView((prev) => (sameView(prev, next) ? prev : next));
  }, []);

  // ── live না থাকলে (অন্য পেজে গেলে / tab লুকালে) view-timer বন্ধ ──
  // view state মোছা হয় না, তাই ফিরে এলে একই ভিডিও একই জায়গা থেকে চলবে
  useEffect(() => {
    if (!isLive) clearAllTimers();
  }, [isLive, clearAllTimers]);

  // ── প্রথম অবস্থা (initial view) ──
  // FlashList প্রথমবার list দেখানোর পর (বা refresh-এর পর) viewability callback
  // সবসময় ফায়ার করে না, স্ক্রল করলে তবেই করে। তাই কোনো অবস্থা set না থাকলে
  // প্রথম post-কেই ডিফল্ট ধরা হয়: ভিডিও হলে সেটাই চলবে।
  // পরে আসল callback এলে সেটাই অগ্রাধিকার পাবে।
  // নোট: এটা শুধু state বসায়। আসলে চলবে কিনা তা isLive ঠিক করে,
  // তাই feed পেছনে থাকলে এই effect কোনো ভিডিও চালাবে না।
  const firstPostId = posts[0]?._id;

  useEffect(() => {
    if (!isActive || isLoading || isRefreshing || !firstPostId) return;
    if (lastViewRef.current.base !== null) return;

    const first = postsRef.current[0];
    applyView({ base: 0, playing: isVideoPost(first) ? 0 : null });
  }, [isActive, isLoading, isRefreshing, firstPostId, applyView]);

  // ── কোন কোন ভিডিও আগে থেকে লোড থাকবে ──
  const videoIndices = useMemo(() => {
    const list: number[] = [];
    posts.forEach((post, i) => {
      if (isVideoPost(post)) list.push(i);
    });
    return list;
  }, [posts]);

  const baseIndex = view.playing ?? view.base;

  // এখন যে ভিডিও আসলেই চলবে (live না হলে কিছুই না)
  const playingIndex = isLive ? view.playing : null;

  const preloadSet = useMemo(() => {
    const set = new Set<number>();

    // live না থাকলে: শুধু যে ভিডিওটা চলছিল সেটা লোড (pause) অবস্থায় রাখো,
    // তাহলে ফিরে এলে timeline একই থাকবে। বাকি সব unload।
    if (!isLive) {
      if (view.playing !== null) set.add(view.playing);
      return set;
    }

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
  }, [videoIndices, baseIndex, isLive, view.playing]);

  // ── Pull to refresh ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    // ছাড়ার সাথে সাথেই আমাদের loader চালু, যাতে ডিফল্ট spinner-এর
    // জন্য কোনো ফাঁকা সময় না থাকে
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      // নেট না থাকলে cache কেটে ফেলব না, পুরনো post গুলো থাকবে
      // (উপরে NetworkBanner আগে থেকেই offline দেখাচ্ছে)
      const net = await NetInfo.fetch();
      if (net.isConnected === false || net.isInternetReachable === false) {
        return; // finally-তে loader বন্ধ হবে
      }

      clearAllTimers();
      lastViewRef.current = EMPTY_VIEW;
      setView(EMPTY_VIEW);

      const result = await refresh();

      if (result.failed) {
        Alert.alert(t("feedData.refreshFailed"), getErrorMessage(result.error));
      }
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [clearAllTimers, refresh, t]);

  // ── পরের page আনার একটাই জায়গা (দুই ট্রিগারই এটা ব্যবহার করে) ──
  const loadMoreIfNeeded = useCallback(() => {
    // next page-এর error থাকলে নিজে নিজে আবার চালাবে না,
    // user "আবার চেষ্টা করো" চাপলে তখন চলবে
    if (isFetchNextPageError) return;
    if (!hasNextPage || isFetchingNextPage || isRefreshingRef.current) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  // ব্যাকআপ: ইউজার খুব দ্রুত স্ক্রল করে একদম শেষে চলে গেলে
  const handleEndReached = useCallback(() => {
    loadMoreIfNeeded();
  }, [loadMoreIfNeeded]);

  // ── ভিডিও visibility + আগে থেকে load + view tracker ──
  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      // লুকানো tab বা পেছনে থাকা screen থেকে কিছু গোনা হবে না
      if (!isLiveRef.current) return;

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
          isVideoVisible={playingIndex === index}
          isVideoNearVisible={preloadSet.has(index)}
        />
      );
    },
    [playingIndex, preloadSet],
  );

  const renderFooter = useCallback(() => {
    // refresh-এর সময় নিচে কিছু দেখাবে না (উপরে আমাদের loader আছে)
    if (isRefreshing) return null;

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
            {t("feedData.loadMoreFailed")}
          </Text>
          <TouchableOpacity
            onPress={() => fetchNextPage()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {t("common.retry")}
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
            {t("feedData.noMorePosts")}
          </Text>
        </View>
      );
    }

    return null;
  }, [
    isRefreshing,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    posts.length,
    fetchNextPage,
    t,
  ]);

  // list-এর ভেতরে loading / error / খালি অবস্থা
  // (keepListOnEmpty = true হলে header ও pull-to-refresh ঠিক থাকে)
  const renderEmpty = useCallback(() => {
    if (isLoading) return <PostCardSkeleton />;

    if (isError) {
      return (
        <View className="py-10 px-8 items-center gap-3">
          <Text className="text-text-secondary dark:text-dark-text-secondary text-sm text-center">
            {getErrorMessage(error)}
          </Text>
          <TouchableOpacity
            onPress={() => onRetry()}
            activeOpacity={0.8}
            className="px-5 py-2.5 rounded-full border border-border dark:border-dark-border"
          >
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {t("common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="py-10 items-center">
        <Text className="text-gray-500 dark:text-dark-text text-sm text-center px-6">
          {emptyText ?? t("feedData.emptyFeed")}
        </Text>
      </View>
    );
  }, [isLoading, isError, error, onRetry, emptyText, t]);

  // Loading: header-এর নিচে শুরু হবে
  if (isLoading && !keepListOnEmpty) {
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
  if (isError && posts.length === 0 && !keepListOnEmpty) {
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
      // playing / preload window / post সংখ্যা / focus বদলালে cell গুলো আবার render হবে
      extraData={`${playingIndex}|${baseIndex}|${posts.length}|${isLive}`}
      keyExtractor={(item) => item._id}
      getItemType={getItemType}
      renderItem={renderItem}
      drawDistance={DRAW_DISTANCE}
      viewabilityConfig={VIEWABILITY_CONFIG}
      ListHeaderComponent={
        <View className="">
          {refreshLoader}
          {isActive && showUploadProgress && <UploadProgressBar />}
          {headerExtra}
        </View>
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      // এটা শুধু ব্যাকআপ, আসল ট্রিগার handleViewableItemsChanged-এ
      onEndReachedThreshold={1}
      showsVerticalScrollIndicator={false}
      // header (+ tabs) এর নিচ থেকে content শুরু হবে, নিচে bottomInset পরিমাণ ফাঁকা
      contentContainerStyle={{
        paddingTop: topInset,
        paddingBottom: bottomInset,
      }}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        // ডিফল্ট spinner পুরো লুকানো, gesture আগের মতোই কাজ করবে
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["transparent"]} // Android spinner-এর রঙ লুকানো
          progressBackgroundColor="transparent" // Android বৃত্তের পটভূমি লুকানো
          tintColor="transparent" // iOS spinner লুকানো
          // Android: বৃত্ত + shadow স্ক্রিনের বাইরে পাঠানো (শুধু transparent যথেষ্ট না)
          progressViewOffset={
            Platform.OS === "android" ? ANDROID_HIDDEN_SPINNER_OFFSET : topInset
          }
        />
      }
    />
  );
}
