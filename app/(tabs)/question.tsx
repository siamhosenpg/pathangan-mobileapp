import ErrorState from "@/components/error/ErrorState";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import QuestionCardSkeleton from "@/components/ui/card/questioncard/QuestionCardSkeleton";
import CollapsibleLayout from "@/components/ui/headers/CollapsibleLayout";
import { Header } from "@/components/ui/headers/Header";

import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";
import { useCollapsibleHeader } from "@/hooks/header/useCollapsibleHeader";
import { useGetAllQuestionsInfiniteQuery } from "@/redux/api/post/questionApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Android-এর ডিফল্ট spinner স্ক্রিনের উপরে বাইরে পাঠিয়ে লুকানোর জন্য
// (বড় negative মান দিলে বৃত্তটা কখনোই দেখা যায় না, কিন্তু টানার gesture ঠিকই কাজ করে)
const ANDROID_HIDDEN_SPINNER_OFFSET = -300;

export default function QuestionScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const collapsible = useCollapsibleHeader();
  const onScroll = collapsible.getScrollHandler("questions");
  const { barH } = collapsible;

  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useGetAllQuestionsInfiniteQuery({ limit: 10 });

  const allQuestions = useMemo(
    () => data?.pages.flatMap((page) => page.questions) ?? [],
    [data],
  );

  // pull-to-refresh এর নিজস্ব state: user ছাড়লেই true, কাজ শেষে false
  // (isFetching থেকে নেওয়া হয় না, নইলে background fetch-এও loader আসবে)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // দুবার refresh চালু হওয়া আটকাতে (state-এর চেয়ে ref তাৎক্ষণিক)
  const isRefreshingRef = useRef(false);

  const handleEndReached = useCallback(() => {
    // next page-এর error থাকলে নিজে নিজে আবার চালাবে না,
    // user "আবার চেষ্টা করো" চাপলে তখন চলবে
    if (isFetchNextPageError) return;
    if (isRefreshingRef.current) return;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    // ছাড়ার সাথে সাথেই আমাদের loader চালু, যাতে ডিফল্ট spinner-এর
    // জন্য কোনো ফাঁকা সময় না থাকে
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      // নেট না থাকলে refetch চালাবে না (উপরে NetworkBanner আগে থেকেই দেখাচ্ছে)
      const net = await NetInfo.fetch();
      if (net.isConnected === false || net.isInternetReachable === false) {
        return; // finally-তে loader বন্ধ হবে
      }

      const result = await refetch();

      // refresh fail হলেও পুরনো প্রশ্নগুলো থাকবে, শুধু user কে জানাই
      if (result.isError && allQuestions.length > 0) {
        Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(result.error));
      }
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refetch, allQuestions.length]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof allQuestions)[number] }) => (
      <QuestionCard post={item} />
    ),
    [],
  );

  const renderFooter = useCallback(() => {
    // 1) next page আসছে -> skeleton
    if (isFetchingNextPage) {
      return <QuestionCardSkeleton />;
    }

    // 2) next page fail -> পুরনো প্রশ্ন থাকবে, নিচে শুধু ছোট retry
    if (isFetchNextPageError) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            আরও প্রশ্ন লোড করা যায়নি
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

    return null;
  }, [isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  // Refresh loader — list-এর header-এর ভেতরে, তাই প্রশ্নের সাথে scroll করবে
  // null না দিয়ে undefined, নইলে type error আসে
  const refreshLoader = isRefreshing ? (
    Platform.OS === "ios" ? (
      // iOS: pull করলে ওপরে যে ফাঁকা জায়গা তৈরি হয়, loader সেই জায়গায় বসে
      <View style={{ height: 0 }} pointerEvents="none">
        <View style={{ position: "absolute", top: -64, left: 0, right: 0 }}>
          <PullRefreshLoader />
        </View>
      </View>
    ) : (
      // Android: list-এর ওপরে নিজের জায়গা নিয়ে বসে, প্রশ্ন একটু নিচে নামে
      <PullRefreshLoader />
    )
  ) : undefined;

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <CollapsibleLayout
        collapsible={collapsible}
        header={<Header title={t("questions")} />}
      >
        {/* Loading */}
        {isLoading && (
          <View style={{ rowGap: 4, paddingTop: barH }}>
            <QuestionCardSkeleton />
            <QuestionCardSkeleton />
            <QuestionCardSkeleton />
          </View>
        )}

        {/* Error — শুধু তখনই full-screen, যখন দেখানোর মতো একটা প্রশ্নও নেই */}
        {!isLoading && isError && allQuestions.length === 0 && (
          <View style={{ flex: 1, paddingTop: barH }}>
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          </View>
        )}

        {/* Empty */}
        {!isLoading && !isError && allQuestions.length === 0 && (
          <View
            className="flex-1 items-center justify-center gap-y-2"
            style={{ paddingTop: barH }}
          >
            <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
            <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {t("noQuestions")}
            </Text>
          </View>
        )}

        {/* List — next page error হলেও পুরনো প্রশ্নগুলো থাকবে */}
        {!isLoading && allQuestions.length > 0 && (
          <FlatList
            data={allQuestions}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingTop: barH,
              paddingBottom: insets.bottom + 10,
              rowGap: 0,
            }}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={refreshLoader}
            ListFooterComponent={renderFooter}
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
                  Platform.OS === "android"
                    ? ANDROID_HIDDEN_SPINNER_OFFSET
                    : barH
                }
              />
            }
          />
        )}
      </CollapsibleLayout>
    </SafeAreaView>
  );
}
