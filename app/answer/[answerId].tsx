// app/answer/[answerId].tsx
import { AnswerDetail } from "@/components/ui/card/questioncard/AnswerDetail";
import { useGetAnswerByIdQuery } from "@/redux/api/answer/answersApi";
import { useGetPostByIdQuery } from "@/redux/api/postApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AnswerDetailPage() {
  const { answerId } = useLocalSearchParams<{ answerId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError } = useGetAnswerByIdQuery(answerId);

  const questionId = data?.answer?.questionId ?? "";
  const { data: questionData, isLoading: questionLoading } =
    useGetPostByIdQuery(questionId, { skip: !questionId });

  const isPageLoading = isLoading || (!!questionId && questionLoading);

  return (
    <View
      className="flex-1 bg-background-secondary dark:bg-dark-background-secondary"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-background dark:bg-dark-background items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#6d6d6d" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-text dark:text-dark-text">
          উত্তর বিস্তারিত
        </Text>
      </View>

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
          contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* প্রশ্ন card */}
          {questionData && (
            <View className="bg-background dark:bg-dark-background rounded-3xl p-5">
              <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-2">
                প্রশ্ন
              </Text>

              {/* প্রশ্নকর্তার info */}
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary overflow-hidden items-center justify-center">
                  {questionData.userid?.profileImage ? (
                    <Image
                      source={{ uri: questionData.userid.profileImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
                      {questionData.userid?.name?.[0]}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-sm font-semibold text-text dark:text-dark-text">
                    {questionData.userid?.name}
                  </Text>
                  <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                    {questionData.userid?.username}
                  </Text>
                </View>
              </View>

              {/* প্রশ্নের টেক্সট */}
              <Text className="text-base font-semibold text-text dark:text-dark-text leading-snug">
                {questionData.question?.questionText}
              </Text>
            </View>
          )}

          {/* উত্তর card */}
          <AnswerDetail answer={data.answer} />
        </ScrollView>
      )}
    </View>
  );
}
