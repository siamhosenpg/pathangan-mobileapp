import CourseCardFeed from "@/components/ui/card/course/CourseCardFeed";
import Postcard from "@/components/ui/card/postcard/Postcard";
import QuestionCard from "@/components/ui/card/questioncard/QuestionCard";
import { useGetSavedItemsQuery } from "@/redux/api/save/savedItemApi";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  collectionId: string;
}

export function SavedPostsList({ collectionId }: Props) {
  const { data, isLoading, isError } = useGetSavedItemsQuery(collectionId, {
    skip: !collectionId,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Ionicons name="alert-circle-outline" size={40} color="#6d6d6d" />
        <Text className="text-text-tertiary text-sm mt-3">
          লোড করতে সমস্যা হয়েছে
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Ionicons name="bookmark-outline" size={44} color="#dddddd" />
        <Text className="text-text-tertiary text-sm mt-3">
          এই ফোল্ডারে কোনো পোস্ট নেই
        </Text>
      </View>
    );
  }

  return (
    <>
      {data.map((item) => {
        const post = item.postId;
        if (!post) return null;
        if (post.postType === "question")
          return <QuestionCard key={item._id} post={post} />;
        if (post.postType === "course")
          return <CourseCardFeed key={item._id} post={post} />;
        return <Postcard key={item._id} post={post} />;
      })}
    </>
  );
}
