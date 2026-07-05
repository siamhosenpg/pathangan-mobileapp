// app/answer/[answerId].tsx
import { AnswerDetail } from "@/components/ui/card/questioncard/AnswerDetail";
import BackHeader from "@/components/ui/headers/BackHeader";
import { useGetAnswerByIdQuery } from "@/redux/api/answer/answersApi";
import { useGetPostByIdQuery } from "@/redux/api/postApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnswerDetailPage() {
  const { answerId } = useLocalSearchParams<{ answerId: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useGetAnswerByIdQuery(answerId);

  const questionId = data?.answer?.questionId ?? "";
  const { data: questionData, isLoading: questionLoading } =
    useGetPostByIdQuery(questionId, { skip: !questionId });

  const isPageLoading = isLoading || (!!questionId && questionLoading);

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background pb-2"
    >
      {/* Header */}
      <BackHeader />

      {/* Loading skeleton */}
      {isPageLoading ? (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* প্রশ্ন skeleton */}
          <View className="bg-background dark:bg-dark-background rounded-3xl p-5">
            <View className="h-3 w-16 bg-background-secondary dark:bg-dark-background-secondary rounded mb-3" />
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
              <View className="gap-1.5">
                <View className="h-3 w-24 bg-background-secondary dark:bg-dark-background-secondary rounded" />
                <View className="h-2.5 w-16 bg-background-secondary dark:bg-dark-background-secondary rounded" />
              </View>
            </View>
            <View className="h-5 w-3/4 bg-background-secondary dark:bg-dark-background-secondary rounded" />
          </View>

          {/* উত্তর skeleton */}
          <View className="bg-background dark:bg-dark-background rounded-3xl p-5">
            <View className="h-3 w-12 bg-background-secondary dark:bg-dark-background-secondary rounded mb-3" />
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />
              <View className="h-3 w-24 bg-background-secondary dark:bg-dark-background-secondary rounded" />
            </View>
            <View className="gap-2">
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="h-3 bg-background-secondary dark:bg-dark-background-secondary rounded"
                />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : isError || !data?.answer ? (
        /* Error state */
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
            উত্তর খুঁজে পাওয়া যায়নি।
          </Text>
        </View>
      ) : (
        /* মূল content */
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ gap: 10, paddingBottom: 32, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* উত্তর card */}
          <AnswerDetail
            answer={data.answer}
            Question={questionData?.question?.questionText}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
