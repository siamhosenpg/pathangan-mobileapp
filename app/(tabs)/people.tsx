import ErrorState from "@/components/error/ErrorState";
import UserCardSuggestion from "@/components/ui/card/user/UserCardSuggestion";
import UserCardSuggestionSkeleton from "@/components/ui/card/user/UserCardSuggestionSkeleton";
import { Header } from "@/components/ui/headers/Header";

import { useGetPeopleSuggestionsQuery } from "@/redux/api/user/peopleApi";
import { getErrorMessage } from "@/utils/getErrorMessage"; // path ঠিক করে নিও
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PeopleScreen() {
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, error, isLoading, isFetching, isError, refetch } =
    useGetPeopleSuggestionsQuery({
      cursor,
      limit: 10,
    });

  const { t } = useTranslation();

  const users = data?.users ?? [];

  // শুধু তখনই full-screen error, যখন দেখানোর মতো একজন user-ও নেই
  const showFullError = !isLoading && isError && users.length === 0;
  const showList = !isLoading && !showFullError;

  const handleLoadMore = useCallback(() => {
    // error thakle nije nije abar chalabo na,
    // user "আবার চেষ্টা করো" chaple tokhon chalbe
    if (isError) return;
    if (!isFetching && data?.hasMore && data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [isError, isFetching, data?.hasMore, data?.nextCursor]);

  const renderFooter = useCallback(() => {
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
  }, [isFetching, isError, users.length, refetch]);

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
          renderItem={({ item }) => <UserCardSuggestion user={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-text-secondary dark:text-dark-text-secondary text-sm">
                কোনো সাজেস্টেড ইউজার নেই
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
