import ErrorState from "@/components/error/ErrorState";
import PrivateQuestionPersonCard from "@/components/ui/card/questioncard/PrivateQuestionPersonCard";
import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";
import { useGetPrivateQuestionPeopleInfiniteQuery } from "@/redux/api/privateQuestion/privateQuestionApi";
import type {
  PrivateQuestionPerson,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Android-এর ডিফল্ট spinner স্ক্রিনের উপরে বাইরে পাঠিয়ে লুকানোর জন্য
// (বড় negative মান দিলে বৃত্তটা কখনোই দেখা যায় না, কিন্তু টানার gesture ঠিকই কাজ করে)
const ANDROID_HIDDEN_SPINNER_OFFSET = -300;

type Props = {
  mode: QuestionMode;
  onPress: (person: PrivateQuestionPerson) => void;
};

const PeopleTab = ({ mode, onPress }: Props) => {
  const { t } = useTranslation();

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
  } = useGetPrivateQuestionPeopleInfiniteQuery({ mode, limit: 15 });

  const people = useMemo(
    () => data?.pages?.flatMap((p) => p.people) ?? [],
    [data],
  );

  // pull-to-refresh এর নিজস্ব state: user ছাড়লেই true, কাজ শেষে false
  // (isFetching থেকে নেওয়া হয় না, নইলে background fetch-এও loader আসবে)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // দুবার refresh চালু হওয়া আটকাতে (state-এর চেয়ে ref তাৎক্ষণিক)
  const isRefreshingRef = useRef(false);

  const peopleLengthRef = useRef(people.length);
  peopleLengthRef.current = people.length;

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    // ছাড়ার সাথে সাথেই আমাদের loader চালু, যাতে ডিফল্ট spinner-এর
    // জন্য কোনো ফাঁকা সময় না থাকে
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
      // নেট না থাকলে refetch চালাবে না, পুরনো list থাকবে
      // (finally-তে loader বন্ধ হবে)
      const net = await NetInfo.fetch();
      if (net.isConnected === false || net.isInternetReachable === false) {
        return;
      }

      const result = await refetch();

      // refresh fail হলেও পুরনো list থাকবে, শুধু user কে জানাই
      if (result.isError && peopleLengthRef.current > 0) {
        Alert.alert(
          t("privateData.refreshFailed"),
          getErrorMessage(result.error),
        );
      }
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refetch, t]);

  const handleEndReached = useCallback(() => {
    // next page-এর error থাকলে নিজে নিজে আবার চালাবে না,
    // user "আবার চেষ্টা করো" চাপলে তখন চলবে
    if (isFetchNextPageError) return;
    // refresh cholar somoy notun page anbo na
    if (isRefreshingRef.current) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: PrivateQuestionPerson }) => (
      <PrivateQuestionPersonCard person={item} mode={mode} onPress={onPress} />
    ),
    [mode, onPress],
  );

  const keyExtractor = useCallback(
    (item: PrivateQuestionPerson) => String(item.userId),
    [],
  );

  const renderFooter = useCallback(() => {
    // refresh-এর সময় নিচে spinner দেখাবে না (উপরে আমাদের loader আছে)
    if (isRefreshing) return null;

    // 1) next page আসছে -> spinner
    if (isFetchingNextPage) {
      return (
        <ActivityIndicator
          size="small"
          color="#00914d"
          style={{ paddingVertical: 16 }}
        />
      );
    }

    // 2) next page fail -> পুরনো list থাকবে, নিচে শুধু ছোট retry
    if (isFetchNextPageError) {
      return (
        <View className="py-6 px-8 items-center gap-3">
          <Text className="text-sm text-center text-text-secondary dark:text-dark-text-secondary">
            {t("privateData.loadMoreFailed")}
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

    return null;
  }, [
    isRefreshing,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    t,
  ]);

  // Refresh loader — list-এর header-এর ভেতরে, তাই কার্ডের সাথে scroll করবে
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
      // Android: list-এর ওপরে নিজের জায়গা নিয়ে বসে, কার্ড একটু নিচে নামে
      <PullRefreshLoader />
    )
  ) : undefined;

  // প্রথমবার load হচ্ছে (refresh না)
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  // শুধু তখনই full-screen error, যখন দেখানোর মতো কিছুই নেই
  if (isError && people.length === 0) {
    return (
      <View className="flex-1">
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={people}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={refreshLoader}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <Text className="text-3xl mb-2">📭</Text>
            <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary text-center">
              {mode === "inbox"
                ? t("privateData.emptyInbox")
                : t("privateData.emptySent")}
            </Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
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
    </View>
  );
};

export default PeopleTab;
