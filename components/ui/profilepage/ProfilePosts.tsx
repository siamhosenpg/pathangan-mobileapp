import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import { useGetPostsByUserIdInfiniteQuery } from "@/redux/api/postApi";
import type { Post } from "@/types/postTypes";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

interface Props {
  userid: string;
}

export default function ProfilePosts({ userid }: Props) {
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

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-10 items-center">
        <Text className="text-text-secondary text-sm">
          পোস্ট লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <View className="py-10 items-center">
        <Text className="text-text-secondary text-sm">কোনো পোস্ট নেই</Text>
      </View>
    );
  }

  const renderItem = ({ item: post }: { item: Post }) => {
    if (!post) return null;
    if (post.postType === "question") return <QuestionCard post={post} />;
    if (post.postType === "course") return <CourseCardFeed post={post} />;
    return <Postcard post={post} />;
  };

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

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View className="h-2" />}
    />
  );
}
