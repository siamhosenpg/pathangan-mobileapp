import PostPageLeft from "@/components/layout/postpage/PostPageLeft";
import CommentsSection from "@/components/ui/comments/CommentsSection";
import { useGetPostByIdQuery } from "@/redux/api/postApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const commentsRef = useRef<ScrollView>(null);

  const { data: post, isLoading, isError } = useGetPostByIdQuery(id);

  const scrollToComments = () => {
    commentsRef.current?.scrollToEnd({ animated: true });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary">
          পোস্ট লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="bg-background dark:bg-dark-background border-b border-border dark:border-dark-border px-4 pb-3 flex-row items-center gap-3"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#00914d" />
        </TouchableOpacity>

        <Text className="text-base font-bold text-text dark:text-dark-text">
          পোস্ট
        </Text>
      </View>

      {/* Body */}
      <ScrollView
        ref={commentsRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          gap: 8,
        }}
      >
        {/* Post */}
        <PostPageLeft post={post} onCommentPress={scrollToComments} />

        {/* Comments */}
        <View className="bg-background dark:bg-dark-background min-h-[300px] overflow-hidden">
          <CommentsSection
            postId={post._id}
            commentsCount={post.commentsCount}
          />
        </View>
      </ScrollView>
    </View>
  );
}
