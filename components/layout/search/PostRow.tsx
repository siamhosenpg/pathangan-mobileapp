import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  post: Post;
}

const getBadge = (postType: string) => {
  switch (postType) {
    case "question":
      return { label: "প্রশ্ন", color: "#7C3AED", bg: "#EDE9FE" };
    case "course":
      return { label: "কোর্স", color: "#0369A1", bg: "#E0F2FE" };
    default:
      return { label: "পোস্ট", color: "#059669", bg: "#D1FAE5" };
  }
};

const getMainText = (post: Post): string => {
  if (post.postType === "question") return post.question?.questionText ?? "";
  if (post.postType === "course") return post.course?.title ?? "";
  return post.content?.text ?? post.content?.title ?? "";
};

export default function PostRow({ post }: Props) {
  const router = useRouter();
  const badge = getBadge(post.postType);
  const text = getMainText(post);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/post/${post._id}` as any)}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        gap: 8,
      }}
    >
      {/* Author row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#F3F4F6",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {post.userid?.profileImage ? (
            <Image
              source={{ uri: post.userid.profileImage }}
              style={{ width: 28, height: 28 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "600" }}>
              {post.userid?.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={{ fontSize: 12, fontWeight: "600", color: "#374151", flex: 1 }}
        >
          {post.userid?.name ?? "অজানা"}
        </Text>

        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 99,
            backgroundColor: badge.bg,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "600", color: badge.color }}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      {text ? (
        <Text
          numberOfLines={2}
          style={{ fontSize: 13, color: "#1F2937", lineHeight: 19 }}
        >
          {text}
        </Text>
      ) : null}

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="heart-outline" size={12} color="#9CA3AF" />
          <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
            {post.likesCount ?? 0}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="chatbubble-outline" size={12} color="#9CA3AF" />
          <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
            {post.commentsCount ?? 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
