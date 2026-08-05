import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import BackHeader from "@/components/ui/headers/BackHeader";
import { useGetQuestionByIdQuery } from "@/redux/api/post/questionApi";

import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function QuestionDetailScreen() {
  const { questionid } = useLocalSearchParams<{ questionid: string }>();

  const insets = useSafeAreaInsets();
  const commentsRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useGetQuestionByIdQuery(questionid);

  const scrollToComments = () => {
    commentsRef.current?.scrollToEnd({ animated: true });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00914d"]}
            tintColor="#00914d"
          />
        }
      >
        {/* Post */}
        <QuestionCard post={post} />
      </ScrollView>
    </SafeAreaView>
  );
}
