import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import { Header } from "@/components/ui/headers/Header";
import { useGetAllQuestionsInfiniteQuery } from "@/redux/api/post/questionApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuestionScreen() {
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllQuestionsInfiniteQuery({ limit: 10 });

  const allQuestions = data?.pages.flatMap((page) => page.questions) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#00914d" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      {/* Header */}
      <Header title="প্রশ্নসমূহ" />

      {/* Loading */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00914d" />
        </View>
      ) : isError ? (
        /* Error */
        <View className="flex-1 items-center justify-center gap-y-2">
          <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />

          <Text className="text-sm text-gray-500 dark:text-dark-gray-500">
            প্রশ্ন লোড করা যায়নি
          </Text>
        </View>
      ) : allQuestions.length === 0 ? (
        /* Empty */
        <View className="flex-1 items-center justify-center gap-y-2">
          <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />

          <Text className="text-sm text-gray-400 dark:text-dark-gray-400">
            এখনো কোনো প্রশ্ন নেই
          </Text>
        </View>
      ) : (
        /* List */
        <FlatList
          data={allQuestions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <QuestionCard post={item} />}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 90,
            rowGap: 8,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}
