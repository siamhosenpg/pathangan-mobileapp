import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import CreatePostCard from "@/components/ui/card/createpostcard/CreatePostCard";
import Postcard from "@/components/ui/card/postcard/Postcard";
import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import UploadProgressBar from "@/components/ui/upload/UploadProgressBar";
import { useGetPostsInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Text, View } from "react-native";

interface HomeFeedProps {
  onScroll?: (scrollY: number) => void;
}

const ItemSeparator = () => <View style={{ height: 4 }} />;

const ListEmpty = () => (
  <View className="py-10 items-center">
    <Text className="text-gray-500 dark:text-dark-text text-sm">
      কোনো পোস্ট নেই
    </Text>
  </View>
);

export default function HomeFeed({ onScroll }: HomeFeedProps) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetPostsInfiniteQuery({ limit: 10 });

  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const lastVisibleIndexRef = useRef<number | null>(null);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  useFocusEffect(
    useCallback(() => {
      setVisibleIndex(lastVisibleIndexRef.current);
      return () => setVisibleIndex(null);
    }, []),
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    const visible = viewableItems.find((v: any) => v.isViewable);
    const index = visible?.index ?? null;
    lastVisibleIndexRef.current = index;
    setVisibleIndex(index);
  }, []);

  const renderItem = useCallback(
    ({ item: post, index }: { item: Post; index: number }) => {
      if (!post) return null;
      if (post.postType === "question") return <QuestionCard post={post} />;
      if (post.postType === "course") return <CourseCardFeed post={post} />;

      const isVideoVisible = visibleIndex === index;
      const isNearVisible =
        visibleIndex !== null && Math.abs(index - visibleIndex) <= 2; // ±2

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

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <PostCardSkeleton />
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-gray-500 dark:text-dark-text text-sm">
            আর কোনো পোস্ট নেই
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, posts.length]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950 dark:bg-dark-background-secondary">
        <Text className="text-gray-400 dark:text-dark-text text-sm">
          পোস্ট লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      ListHeaderComponent={
        <View className="mb-1">
          <CreatePostCard />
          <UploadProgressBar />
        </View>
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={ListEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10 }}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
}
