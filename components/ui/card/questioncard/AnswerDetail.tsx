// components/ui/card/questioncard/AnswerDetail.tsx
import type { Answer } from "@/types/answerTypes";
import { Image, Text, View } from "react-native";
import { AnswerRating } from "../../star/AnswerRating";

export function AnswerDetail({ answer }: { answer: Answer }) {
  return (
    <View className="bg-background dark:bg-dark-background rounded-3xl p-5">
      {/* সেকশন লেবেল */}
      <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-3">
        উত্তর
      </Text>

      {/* ইউজার info */}
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-9 h-9 rounded-full bg-background-secondary dark:bg-dark-background-secondary overflow-hidden shrink-0 items-center justify-center">
          {answer.userId.profileImage ? (
            <Image
              source={{ uri: answer.userId.profileImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
              {answer.userId.name?.[0]}
            </Text>
          )}
        </View>

        <Text className="text-sm font-semibold text-text dark:text-dark-text">
          {answer.userId.name}
        </Text>
      </View>

      {/* উত্তরের মূল টেক্সট */}
      <Text className="text-sm text-text dark:text-dark-text leading-relaxed">
        {answer.text}
      </Text>

      {/* রেটিং component */}
      <AnswerRating answerId={answer._id} />

      {/* vote ও best answer */}
      <View className="flex-row items-center gap-4 mt-4 pt-4 border-t border-border dark:border-dark-border">
        {/* ইতিবাচক */}
        <View className="flex-row items-center gap-1">
          <Text className="font-medium text-sm text-text dark:text-dark-text">
            {answer.upvotesCount}
          </Text>
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
            ইতিবাচক
          </Text>
        </View>

        {/* নেতিবাচক */}
        <View className="flex-row items-center gap-1">
          <Text className="font-medium text-sm text-text dark:text-dark-text">
            {answer.downvotesCount}
          </Text>
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
            নেতিবাচক
          </Text>
        </View>

        {/* সেরা উত্তর badge */}
        {answer.isBestAnswer && (
          <View className="ml-auto bg-accent/10 px-2.5 py-1 rounded-full">
            <Text className="text-xs font-medium text-accent">
              সেরা উত্তর ✓
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
