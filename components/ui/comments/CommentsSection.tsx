import {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
} from "@/redux/api/commentsApi";
import React from "react";
import { Text, View } from "react-native";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

interface Props {
  postId: string;
  commentsCount: number;
}

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "এখনই";
  if (minutes < 60) return `${minutes} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  return `${days} দিন আগে`;
}

export default function CommentsSection({ postId, commentsCount }: Props) {
  const { data, isLoading } = useGetCommentsByPostQuery({ postId });
  const [createComment] = useCreateCommentMutation();

  const handleSubmit = async (text: string) => {
    try {
      await createComment({ postId, text }).unwrap();
    } catch (err) {
      console.error("Failed to create comment", err);
    }
  };

  const comments =
    data?.data.map((c) => ({
      id: c._id,
      name: c.commentUserId?.name || "Unknown",
      text: c.text,
      time: formatTimeAgo(c.createdAt),
      avatar: c.commentUserId?.profileImage,
    })) ?? [];

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border dark:border-dark-border">
        <Text className="text-sm font-bold text-text dark:text-dark-text">
          মন্তব্য ({commentsCount || 0})
        </Text>
      </View>

      {/* List */}
      <CommentList comments={comments} isLoading={isLoading} />

      {/* Input */}
      <CommentInput onSubmit={handleSubmit} />
    </View>
  );
}
