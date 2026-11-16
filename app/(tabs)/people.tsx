import ErrorState from "@/components/error/ErrorState";
import UserCardSuggestion from "@/components/ui/card/user/UserCardSuggestion";
import UserCardSuggestionSkeleton from "@/components/ui/card/user/UserCardSuggestionSkeleton";
import { Header } from "@/components/ui/headers/Header";
import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";

import { useGetPeopleSuggestionsQuery } from "@/redux/api/user/peopleApi";
import { getErrorMessage } from "@/utils/getErrorMessage"; // path ঠিক করে নিও
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

// Android-এর ডিফল্ট spinner স্ক্রিনের উপরে বাইরে পাঠিয়ে লুকানোর জন্য
// (বড় negative মান দিলে বৃত্তটা কখনোই দেখা যায় না, কিন্তু টানার gesture ঠিকই কাজ করে)
const ANDROID_HIDDEN_SPINNER_OFFSET = -300;

export default function PeopleScreen() {
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, error, isLoading, isFetching, isError, refetch } =
    useGetPeopleSuggestionsQuery({
      cursor,
      limit: 10,
    });

  const { t } = useTranslation();

  // একই user দুবার এলে (বিরল) একবারই দেখাবে
  const users = useMemo(() => {
    const seen = new Set<string>();
    const list: NonNullable<typeof data>["users"] = [];

    for (const user of data?.users ?? []) {
      if (!user || seen.has(user._id)) continue;
      seen.add(user._id);
      list.push(user);
    }

    return list;
  }, [data]);

  // pull-to-refresh এর নিজস্ব state: user ছাড়লেই true, কাজ শেষে false
  const [isRefreshing, setIsRefreshing] = useState(false);

  // দুবার refresh চালু হওয়া আটকাতে (state-এর চেয়ে ref তাৎক্ষণিক)
  const isRefreshingRef = useRef(false);

  // cursor null হওয়া পর্যন্ত অপেক্ষা করে তারপর refetch চালানোর জন্য
  const pendingResetRef = useRef(false);

  const usersLengthRef = useRef(users.length);
  usersLengthRef.current = users.length;

  // শুধু তখনই full-screen error, যখন দেখানোর মতো একজন user-ও নেই
  const showFullError = !isLoading && isError && users.length === 0;
  const showList = !isLoading && !showFullError;

  const finishRefresh = useCallback(() => {
    isRefreshingRef.current = false;
    pendingResetRef.current = false;
    setIsRefreshing(false);
  }, []);

  const runRefetch = useCallback(async () => {
    try {
      const result = await refetch();

      // refresh fail হলেও পুরনো user গুলো থাকবে, শুধু user কে জানাই
      if (result.isError && usersLengthRef.current > 0) {
        Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(result.error));
      }
    } finally {
      finishRefresh();
    }
  }, [refetch, finishRefresh]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    // ছাড়ার সাথে সাথেই আমাদের loader চালু, যাতে ডিফল্ট spinner-এর
    // জন্য কোনো ফাঁকা সময় না থাকে
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    // নেট না থাকলে refetch চালাবে না (উপরে NetworkBanner আগে থেকেই দেখাচ্ছে)
    const net = await NetInfo.fetch();
    if (net.isConnected === false || net.isInternetReachable === false) {
      finishRefresh();
      return;
    }

    if (cursor !== null) {
      // আগে প্রথম page-এ ফিরি, cursor বদলালে নিচের effect refetch চালাবে
      pendingResetRef.current = true;
      setCursor(null);
    } else {
      await runRefetch();
    }
  }, [cursor, finishRefresh, runRefetch]);

  useEffect(() => {
    if (pendingResetRef.current && cursor === null) {
      pendingResetRef.current = false;
      runRefetch();
    }
  }, [cursor, runRefetch]);

  const handleLoadMore = useCallback(() => {
    // error thakle nije nije abar chalabo na,
    // user "আবার চেষ্টা করো" chaple tokhon chalbe
    if (isError) return;
    // refresh cholar somoy notun page anbo na
    if (isRefreshingRef.current) return;
    if (!isFetching && data?.hasMore && data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [isError, isFetching, data?.hasMore, data?.nextCursor]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof users)[number] }) => (
      <UserCardSuggestion user={item} />
    ),
    [],
  );

  const renderFooter = useCallback(() => {
    // refresh-এর সময় নিচে skeleton দেখাবে না (উপরে আমাদের loader আছে)
    if (isRefreshing) return null;

    // 1) notun user ashchhe -> skeleton
    if (isFetching && users.length > 0) {
      return <UserCardSuggestionSkeleton />;
    }

    // 2) load more fail -> purono user thakbe, niche shudhu chhoto retry
    // (refetch ekhon je cursor e fail korechhe sei cursor ei abar chalabe)
    if (isError && users.length > 0) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            আরও ইউজার লোড করা যায়নি
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
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
  }, [isRefreshing, isFetching, isError, users.length, refetch]);

  // Refresh loader — list-এর header-এর ভেতরে, তাই user-দের সাথে scroll করবে
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
      // Android: list-এর ওপরে নিজের জায়গা নিয়ে বসে, user গুলো একটু নিচে নামে
      <PullRefreshLoader />
    )
  ) : undefined;

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <Header title={t("people")} />

      {/* Initial Loading */}
      {isLoading && (
        <View className="">
          <UserCardSuggestionSkeleton />
          <UserCardSuggestionSkeleton />
          <UserCardSuggestionSkeleton />
          <UserCardSuggestionSkeleton />
          <UserCardSuggestionSkeleton />
        </View>
      )}

      {/* Error — শুধু তখনই full-screen, যখন একজন user-ও নেই */}
      {showFullError && (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      )}

      {/* List — load more error হলেও পুরনো user গুলো থাকবে */}
      {showList && (
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingTop: 0,
            gap: 0,
          }}
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={refreshLoader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-text-secondary dark:text-dark-text-secondary text-sm">
                কোনো সাজেস্টেড ইউজার নেই
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
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
                Platform.OS === "android" ? ANDROID_HIDDEN_SPINNER_OFFSET : 0
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
