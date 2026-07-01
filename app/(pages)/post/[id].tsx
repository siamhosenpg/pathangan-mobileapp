import PostPageLeft from "@/components/layout/postpage/PostPageLeft";
import BackHeader from "@/components/ui/headers/BackHeader";
import { useGetPostByIdQuery } from "@/redux/api/postApi";

import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

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
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background dark:bg-dark-background"
    >
      {/* Header */}
      <BackHeader />

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
      </ScrollView>
    </SafeAreaView>
  );
}
