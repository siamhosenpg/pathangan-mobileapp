import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const badge = getBadge(post.postType);
  const text = getMainText(post);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/post/${post._id}` as any)}
      activeOpacity={0.7}
      className="px-4 py-3.5 bg-background dark:bg-dark-background border-b border-background-secondary dark:border-dark-border gap-2"
    >
      {/* Author row */}
      <View className="flex-row items-center gap-2">
        {/* Avatar */}
        <View className="w-7 h-7 rounded-full bg-background-secondary dark:bg-dark-background-secondary overflow-hidden items-center justify-center">
          {post.userid?.profileImage ? (
            <Image
              source={{ uri: post.userid.profileImage }}
              className="w-7 h-7"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-[11px] font-semibold text-text-tertiary dark:text-dark-text-tertiary">
              {post.userid?.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          )}
        </View>

        {/* Name */}
        <Text
          numberOfLines={1}
          className="flex-1 text-xs font-semibold text-text-secondary dark:text-dark-text-secondary"
        >
          {post.userid?.name ?? "অজানা"}
        </Text>

        {/* Badge — inline style শুধু dynamic color এর জন্য */}
        <View
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: badge.bg }}
        >
          <Text
            className="text-[10px] font-semibold"
            style={{ color: badge.color }}
          >
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      {text ? (
        <Text
          numberOfLines={2}
          className="text-[13px] leading-5 text-text dark:text-dark-text"
        >
          {text}
        </Text>
      ) : null}

      {/* Stats */}
      <View className="flex-row gap-3.5">
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="heart-outline"
            size={12}
            color={isDark ? "#8a8a8a" : "#9CA3AF"}
          />
          <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
            {post.likesCount ?? 0}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="chatbubble-outline"
            size={12}
            color={isDark ? "#8a8a8a" : "#9CA3AF"}
          />
          <Text className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
            {post.commentsCount ?? 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
