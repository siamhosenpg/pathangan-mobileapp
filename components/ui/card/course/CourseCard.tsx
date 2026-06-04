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
        <View className="w-[110px] h-[110px] rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary">
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
          <View className="flex-col items-start justify-between gap-2">
            <View className="flex-1">
              <Text
                numberOfLines={2}
                className=" leading-6 text-[13px] font-semibold text-text dark:text-dark-text"
              >
                {course?.title}
              </Text>

              <Text className="text-sm font-semibold mt-1 text-text-secondary dark:text-dark-text-secondary">
                {course?.price === 0 ? "বিনামূল্যে" : `৳${course?.price}`}
              </Text>
            </View>

            {/* USER */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1 flex-1">
                {/* AVATAR */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(`/(tabs)/${userid.username}`)}
                  className="w-7 h-7 rounded-full overflow-hidden bg-accent/15 items-center justify-center"
                >
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
                </TouchableOpacity>

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
                      <GreenMark size={15} mark={userid.greenmarkVerified} />
                    )}
                  </View>
                </View>
              </View>
              <View>
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
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CourseCard;
