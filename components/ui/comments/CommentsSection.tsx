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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
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
