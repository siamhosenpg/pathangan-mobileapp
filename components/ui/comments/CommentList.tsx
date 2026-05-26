import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface Comment {
  id: string;
  name: string;
  text: string;
  time: string;
  avatar?: string;
}

interface Props {
  comments: Comment[];
  isLoading?: boolean;
}

export default function CommentList({ comments, isLoading }: Props) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#00914d" />
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[13px] text-gray-400">কোনো মন্তব্য নেই</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {comments.map((comment) => (
        <View key={comment.id} className="flex-row gap-2.5 mb-4">
          {/* Avatar */}
          <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center shrink-0">
            <Text className="text-xs font-semibold text-accent">
              {comment.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>

          {/* Bubble */}
          <View className="flex-1 min-w-0">
            <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl rounded-tl-sm px-3 py-2.5">
              <Text className="text-xs font-bold text-text dark:text-dark-text mb-0.5">
                {comment.name}
              </Text>

              <Text className="text-[13px] text-text-secondary dark:text-dark-text-secondary leading-[19px]">
                {comment.text}
              </Text>
            </View>

            <Text className="text-[11px] text-gray-400 mt-1 pl-1">
              {comment.time}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
