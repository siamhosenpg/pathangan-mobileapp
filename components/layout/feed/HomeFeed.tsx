import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import CreatePostCard from "@/components/ui/card/createpostcard/CreatePostCard";

import Postcard from "@/components/ui/card/postcard/Postcard";
import PostCardSkeleton from "@/components/ui/card/postcard/PostCardSkeleton";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";

import { useGetPostsInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";

import { FlatList, Text, View } from "react-native";

interface HomeFeedProps {
  onScroll?: (scrollY: number) => void;
}
export default function HomeFeed({ onScroll }: HomeFeedProps) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetPostsInfiniteQuery({ limit: 10 });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-secondary dark:bg-dark-background-secondary ">
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

  const renderItem = ({ item: post }: { item: Post }) => {
    if (!post) return null;

    if (post.postType === "question") {
      return <QuestionCard post={post} />;
    }

    if (post.postType === "course") {
      return <CourseCardFeed post={post} />;
    }

    return <Postcard post={post} />;
  };

  const renderFooter = () => {
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
  };

  const renderEmpty = () => (
    <View className="py-10 items-center">
      <Text className="text-gray-500 dark:text-dark-text text-sm">
        কোনো পোস্ট নেই
      </Text>
    </View>
  );

  return (
    <FlatList
      onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={32} // ✅ smooth tracking
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      // 👇 Create Post Card
      ListHeaderComponent={
        <View className="mb-2">
          <CreatePostCard />
        </View>
      }
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 80,
      }}
      ItemSeparatorComponent={() => <View className="h-2" />}
    />
  );
}
