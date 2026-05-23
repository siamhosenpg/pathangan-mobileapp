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

import PostPageLeft from "@/components/layout/postpage/PostPageLeft";
import CommentsSection from "@/components/ui/comments/CommentsSection";

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
          পোস্ট লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
          পোস্ট
        </Text>
      </View>

      {/* Scrollable body */}
      <ScrollView
        ref={commentsRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Post content */}
        <PostPageLeft post={post} onCommentPress={scrollToComments} />

        {/* Comments */}
        <View
          style={{
            backgroundColor: "#fff",

            overflow: "hidden",
            minHeight: 300,
          }}
        >
          <CommentsSection
            postId={post._id}
            commentsCount={post.commentsCount}
          />
        </View>
      </ScrollView>
    </View>
  );
}
