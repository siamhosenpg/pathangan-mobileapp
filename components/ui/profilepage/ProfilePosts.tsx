import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import usePostViewTracker from "@/hooks/viewcount/usePostViewTracker";
import { useGetPostsByUserIdInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import PostCardSkeleton from "../card/postcard/PostCardSkeleton";

interface Props {
  userid: string;
  listHeader?: React.ReactElement;
}

export default function ProfilePosts({ userid, listHeader }: Props) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetPostsByUserIdInfiniteQuery(
    { userid, limit: 10 },
    { skip: !userid },
  );

  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const lastVisibleIndexRef = useRef<number | null>(null);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const { onViewableItemsChanged: trackViews, clearAllTimers } =
    usePostViewTracker();

  useFocusEffect(
    useCallback(() => {
      setVisibleIndex(lastVisibleIndexRef.current);
      return () => {
        setVisibleIndex(null);
        clearAllTimers(); // ← add
      };
    }, [clearAllTimers]),
  );

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  // FlatList নিজেই scroll করছে তাই onViewableItemsChanged কাজ করবে

  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      const visible = info.viewableItems.find((v: any) => v.isViewable);
      const index = visible?.index ?? null;
      lastVisibleIndexRef.current = index;
      setVisibleIndex(index);

      trackViews(info);
    },
    [trackViews],
  );

  const renderItem = useCallback(
    ({ item: post, index }: { item: Post; index: number }) => {
      if (!post) return null;
      if (post.postType === "question") return <QuestionCard post={post} />;
      if (post.postType === "course") return <CourseCardFeed post={post} />;

      const isVideoVisible = visibleIndex === index;
      const isNearVisible =
        visibleIndex !== null && Math.abs(index - visibleIndex) <= 3;

      return (
        <Postcard
          post={post}
          isVideoVisible={isVideoVisible}
          isVideoNearVisible={isNearVisible}
        />
      );
    },
    [visibleIndex],
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#00914d" />
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-text-secondary text-sm">আর কোনো পোস্ট নেই</Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <View>
        {listHeader}
        <PostCardSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View>
        {listHeader}
        <View className="py-10 items-center">
          <Text className="text-text-secondary text-sm">
            পোস্ট লোড করতে সমস্যা হয়েছে
          </Text>
        </View>
      </View>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <View>
        {listHeader}
        <View className="py-10 items-center">
          <Text className="text-text-secondary text-sm">কোনো পোস্ট নেই</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10 }}
      ItemSeparatorComponent={() => <View className="h-0" />}
    />
  );
}
