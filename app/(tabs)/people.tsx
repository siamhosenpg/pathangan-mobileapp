import UserCardSuggestion from "@/components/ui/card/user/UserCardSuggestion";
import { Header } from "@/components/ui/headers/Header";
import { useGetSuggestedUsersQuery } from "@/redux/api/userApi";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function PeopleScreen() {
  const { data, isLoading, isError } = useGetSuggestedUsersQuery();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-500 text-sm text-center">
          {t("failed_to_load_users")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      {/* Header */}
      <Header title={t("people")} />

      {/* List */}
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          gap: 8,
        }}
        data={data.users}
        keyExtractor={(item) => String(item.userid)}
        renderItem={({ item }) => <UserCardSuggestion user={item} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-text-secondary dark:text-dark-text-secondary text-sm ">
              কোনো সাজেস্টেড ইউজার নেই
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
