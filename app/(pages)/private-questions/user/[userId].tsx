import {
  DELETED_USER_NAME,
  UserAvatar,
} from "@/components/ui/card/questioncard/PrivateQuestionPersonCard";
import ThreadQuestionCard from "@/components/ui/card/questioncard/ThreadQuestionCard";
import { useGetQuestionsWithUserInfiniteQuery } from "@/redux/api/privateQuestion/privateQuestionApi";
import type { QuestionMode } from "@/types/privateQuestionTypes";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserQuestionsPage = () => {
  const { userId, mode } = useLocalSearchParams<{
    userId: string;
    mode?: string;
  }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const viewMode: QuestionMode = mode === "sent" ? "sent" : "inbox";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useGetQuestionsWithUserInfiniteQuery(
    { userId: userId as string, mode: viewMode, limit: 10 },
    { skip: !userId },
  );

  const questions = data?.pages?.flatMap((p) => p.questions) ?? [];
  const otherUser = data?.pages?.[0]?.user ?? null;
  const isDeleted = !otherUser;
  const name = otherUser?.name || otherUser?.username || DELETED_USER_NAME;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/private-questions/privatequestion");
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={handleBack}
          className="mr-3 w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>

        {data && (
          <>
            <UserAvatar
              name={name}
              profileImage={otherUser?.profileImage}
              isDeleted={isDeleted}
              size="sm"
            />
            <View className="ml-3 flex-1">
              <Text
                className={`text-base font-bold ${
                  isDeleted
                    ? "text-text-tertiary dark:text-dark-text-tertiary italic"
                    : "text-text dark:text-dark-text"
                }`}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                {viewMode === "inbox" ? "তার করা প্রশ্ন" : "আপনার করা প্রশ্ন"}
              </Text>
            </View>
          </>
        )}
      </View>

      {isFetching && questions.length === 0 ? (
        <ActivityIndicator size="large" color="#00914d" className="flex-1" />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ThreadQuestionCard
              question={item}
              mode={viewMode}
              onPress={(id) => router.push(`/private-questions/${id}`)}
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-3xl mb-2">📭</Text>
              <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
                কোনো প্রশ্ন নেই
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color="#00914d"
                style={{ paddingVertical: 16 }}
              />
            ) : null
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
};

export default UserQuestionsPage;
