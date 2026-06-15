import UserCardSuggestion from "@/components/ui/card/user/UserCardSuggestion";
import UserCardSuggestionSkeleton from "@/components/ui/card/user/UserCardSuggestionSkeleton";
import { Header } from "@/components/ui/headers/Header";
import { useGetSuggestedUsersQuery } from "@/redux/api/userApi";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";

export default function PeopleScreen() {
  const { data, isLoading, isError } = useGetSuggestedUsersQuery();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      <Header title={t("people")} />

      {/* Loading */}
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
          keyExtractor={(item) => String(item.userid)}
          renderItem={({ item }) => <UserCardSuggestion user={item} />}
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
    </View>
  );
}
