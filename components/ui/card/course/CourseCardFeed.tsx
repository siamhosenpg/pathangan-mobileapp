import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import PostCountLeft from "../postcard/PostCountLeft";

import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import CommentsButton from "../../buttons/CommentsButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";
import PostThreeDotMenu from "../../threedotmenu/PostThreeDotMenu";

interface Props {
  post: Post;
}

const CourseCardFeed = ({ post }: Props) => {
  const { userid, course, createdAt } = post;
  const router = useRouter();
  const thumbnail = course?.media?.find((m) => m.type === "image")?.url;

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View className="bg-background ">
      {/* thumbnail */}
      <View className="p-4">
        <TouchableOpacity
          onPress={() => router.push(`/course/${post._id}`)}
          className="w-full rounded-xl overflow-hidden"
        >
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              className="w-full aspect-square rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full aspect-square rounded-xl bg-indigo-500/10 items-center justify-center border border-border">
              <Text className="text-text-secondary text-sm">ছবি নেই</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* course info */}
      <View className="flex-row gap-3 px-4">
        <TouchableOpacity
          onPress={() =>
            router.push(`/(tabs)/profile?username=${userid.username}`)
          }
          className="w-12 h-12 rounded-full overflow-hidden bg-indigo-500/20 border border-border"
        >
          {userid.profileImage ? (
            <Image
              source={{ uri: userid.profileImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-accent font-bold">
                {userid.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className="text-text font-semibold text-base leading-5"
            numberOfLines={2}
          >
            {course?.title}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-text-secondary text-sm">{userid.name}</Text>
            <Text className="text-text-tertiary text-sm">
              {course?.price === 0 ? "বিনামূল্যে" : `৳${course?.price}`}
            </Text>
          </View>
        </View>
      </View>

      {/* counts + actions */}
      <View className="mt-3">
        <View className="px-4 py-2 border-b border-border">
          <PostCountLeft
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
          />
        </View>

        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-6">
            <LikeButton postId={post._id} initialLiked={post.isReacted} />

            <CommentsButton />

            <ShareButton />
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <PostThreeDotMenu
        postId={post._id}
        postAuthorId={userid._id}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

export default CourseCardFeed;
