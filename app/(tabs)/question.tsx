import ErrorState from "@/components/error/ErrorState";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import QuestionCardSkeleton from "@/components/ui/card/questioncard/QuestionCardSkeleton";
import { Header } from "@/components/ui/headers/Header";

// ✅ পরিবর্তন ১: loader import
import PullRefreshLoader from "@/components/ui/Loader/PullRefreshLoader";
import { useGetAllQuestionsInfiniteQuery } from "@/redux/api/post/questionApi";
import { getErrorMessage } from "@/utils/getErrorMessage"; // path ঠিক করে নিও
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Platform, // ✅ পরিবর্তন ২: Platform import
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function QuestionScreen() {
  const insets = useSafeAreaInsets();
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
    isFetching,
  } = useGetAllQuestionsInfiniteQuery({ limit: 10 });

  const allQuestions = data?.pages.flatMap((page) => page.questions) ?? [];

  const handleEndReached = useCallback(() => {
    // next page er error thakle nije nije abar chalabo na,
    // user "আবার চেষ্টা করো" chaple tokhon chalbe
    if (isFetchNextPageError) return;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    // net na thakle refetch chalabo na (upore NetworkBanner already dekhacche)
    const net = await NetInfo.fetch();
    if (net.isConnected === false || net.isInternetReachable === false) {
      return;
    }

    const result = await refetch();

    // refresh fail holeo purono proshno gulo thakbe, shudhu user ke jani
    if (result.isError && allQuestions.length > 0) {
      Alert.alert("রিফ্রেশ হয়নি", getErrorMessage(result.error));
    }
  }, [refetch, allQuestions.length]);

  const renderFooter = useCallback(() => {
    // 1) next page ashchhe -> skeleton
    if (isFetchingNextPage) {
      return <QuestionCardSkeleton />;
    }

    // 2) next page fail -> purono proshno thakbe, niche shudhu chhoto retry
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

  // প্রথম load বাদে, refetch চলাকালীন refreshing true থাকবে
  const isRefreshing = !isLoading && isFetching && !isFetchingNextPage;

  // ✅ পরিবর্তন ৩: Refresh loader — list-এর header-এর ভেতরে, তাই প্রশ্নের সাথে scroll করবে
  const refreshLoader = isRefreshing ? (
    Platform.OS === "ios" ? (
      // iOS: pull করলে ওপরে যে ফাঁকা জায়গা তৈরি হয়, loader সেই জায়গায় বসে
      <View style={{ height: 0 }} pointerEvents="none">
        <View style={{ position: "absolute", top: -64, left: 0, right: 0 }}>
          <PullRefreshLoader />
        </View>
      </View>
    ) : (
      // Android: list-এর ওপরে নিজের জায়গা নিয়ে বসে
      <PullRefreshLoader />
    )
  ) : null;

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      <Header title={t("questions")} />

      {/* Loading */}
      {isLoading && (
        <View style={{ rowGap: 4 }}>
          <QuestionCardSkeleton />
          <QuestionCardSkeleton />
          <QuestionCardSkeleton />
        </View>
      )}

      {/* Error — শুধু তখনই full-screen, যখন দেখানোর মতো একটা প্রশ্নও নেই */}
      {!isLoading && isError && allQuestions.length === 0 && (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      )}

      {/* Empty */}
      {!isLoading && !isError && allQuestions.length === 0 && (
        <View className="flex-1 items-center justify-center gap-y-2">
          <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
          <Text className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {t("noQuestions")}
          </Text>
        </View>
      )}

      {/* List — next page error হলেও পুরনো প্রশ্ন গুলো থাকবে */}
      {!isLoading && allQuestions.length > 0 && (
        <FlatList
          data={allQuestions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <QuestionCard post={item} />}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 10,
            rowGap: 0,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          // ✅ পরিবর্তন ৪: header-এ loader বসানো হয়েছে
          ListHeaderComponent={refreshLoader}
          ListFooterComponent={renderFooter}
          refreshControl={
            // ✅ পরিবর্তন ৫: default spinner লুকানো, gesture আগের মতোই কাজ করবে
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["transparent"]} // Android spinner লুকানো
              progressBackgroundColor="transparent" // Android spinner-এর গোল background লুকানো
              tintColor="transparent" // iOS spinner লুকানো
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
