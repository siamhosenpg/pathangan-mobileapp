import UserCardSuggestion from "@/components/ui/card/user/UserCardSuggestion";
import UserCardSuggestionSkeleton from "@/components/ui/card/user/UserCardSuggestionSkeleton";
import { Header } from "@/components/ui/headers/Header";
import { useGetPeopleSuggestionsQuery } from "@/redux/api/user/peopleApi";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PeopleScreen() {
  const [cursor, setCursor] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError } = useGetPeopleSuggestionsQuery(
    {
      cursor,
      limit: 10,
    },
  );

  const { t } = useTranslation();

  const handleLoadMore = useCallback(() => {
    if (!isFetching && data?.hasMore && data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [isFetching, data?.hasMore, data?.nextCursor]);

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

      {/* Error */}
      {!isLoading && isError && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-sm text-center">
            {t("failed_to_load_users")}
          </Text>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && data && (
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingTop: 0,
            gap: 0,
          }}
          data={data.users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <UserCardSuggestion user={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching && !isLoading ? (
              <View className="py-4">
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
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
