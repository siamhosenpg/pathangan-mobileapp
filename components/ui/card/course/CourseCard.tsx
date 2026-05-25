import type { Post } from "@/types/postTypes";

import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import GreenMark from "../../badges/GreenMark";

interface Props {
  post: Post;
}

const CourseCard = ({ post }: Props) => {
  const router = useRouter();

  const { userid, course } = post;

  const thumbnail = course?.media?.find((m) => m.type === "image")?.url;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/course/${post._id}`)}
      className="bg-background dark:bg-dark-background px-4 py-3"
    >
      <View className="flex-row gap-3">
        {/* LEFT IMAGE */}
        <View className="w-[120px] h-[120px] rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary">
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={28} color="#9CA3AF" />

              <Text className="text-xs mt-1 text-text-tertiary dark:text-dark-text-tertiary">
                No Image
              </Text>
            </View>
          )}
        </View>

        {/* RIGHT CONTENT */}
        <View className="flex-1 justify-between">
          {/* TOP */}
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text
                numberOfLines={2}
                className="text-[15px] leading-5 font-semibold text-text dark:text-dark-text"
              >
                {course?.title}
              </Text>

              <Text className="text-xs mt-1 text-text-secondary dark:text-dark-text-secondary">
                {course?.price === 0 ? "বিনামূল্যে" : `৳${course?.price}`}
              </Text>
            </View>

            {/* SAVE BUTTON */}
            <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary">
              <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* USER */}
          <TouchableOpacity
            onPress={() =>
              router.push(`/(tabs)/profile?username=${userid.username}`)
            }
            activeOpacity={0.8}
            className="flex-row items-center justify-between mt-4"
          >
            <View className="flex-row items-center gap-2 flex-1">
              {/* AVATAR */}
              <View className="w-10 h-10 rounded-full overflow-hidden bg-accent/15 items-center justify-center">
                {userid.profileImage ? (
                  <Image
                    source={{ uri: userid.profileImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-accent font-bold text-sm">
                    {userid?.name?.charAt(0)?.toUpperCase()}
                  </Text>
                )}
              </View>

              {/* NAME */}
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-semibold text-text dark:text-dark-text"
                  >
                    {userid.name}
                  </Text>

                  {userid.greenmarkVerified && (
                    <GreenMark mark={userid.greenmarkVerified} />
                  )}
                </View>

                {/* COUNTS */}
                <View className="flex-row items-center gap-3 mt-1">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="heart" size={12} color="#EF4444" />

                    <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                      {post.likesCount}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Ionicons name="chatbubble" size={11} color="#6B7280" />

                    <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                      {post.commentsCount}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Ionicons name="repeat" size={12} color="#6B7280" />

                    <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                      {post.sharesCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CourseCard;
