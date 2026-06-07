import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import PostCountLeft from "../postcard/PostCountLeft";

import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";

import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider"; // ✅ add
import { useTranslation } from "react-i18next";
import GreenMark from "../../badges/GreenMark";
import CommentsButton from "../../buttons/CommentsButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";
import CommentSheet from "../../comments/CommentSheet";
import TimeAgo from "../../datetime/TimeAgo";
import PostThreeDotMenu from "../../threedotmenu/PostThreeDotMenu";

interface Props {
  post: Post;
}

const CourseCardFeed = ({ post }: Props) => {
  const { t } = useTranslation();
  const { userid, course, createdAt } = post;
  const router = useRouter();
  const thumbnail = course?.media?.find((m) => m.type === "image")?.url;
  const { open } = useBottomSheet(); // ✅ add

  return (
    <View className="bg-background dark:bg-dark-background ">
      {/* thumbnail */}
      <View className="">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/course/${post._id}`)}
          className="w-full  overflow-hidden p-2 "
        >
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              className="w-full aspect-square rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full aspect-square bg-indigo-500/10 items-center justify-center border border-border dark:border-dark-border">
              <Text className="text-text-secondary dark:text-dark-text-secondary text-sm">
                ছবি নেই
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text
        className="text-text dark:text-dark-text font-semibold text-base leading-6 px-4 pt-1"
        numberOfLines={2}
      >
        {course?.title}
      </Text>
      {/* course info */}
      <View className="flex-row mt-1.5 justify-between gap-2.5 px-4 w-full">
        <View className="flex-row items-center gap-2 ">
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/${userid.username}`)}
            className="w-10 h-10 rounded-full overflow-hidden bg-indigo-500/20 border border-border dark:border-dark-border"
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
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="text-text dark:text-dark-text text-sm font-semibold">
                {userid.name}
              </Text>
              <GreenMark mark={userid?.greenmarkVerified || false} size={12} />
            </View>
            <TimeAgo
              date={createdAt}
              className="text-text-tertiary dark:text-dark-text-tertiary text-[10px]  font-medium"
            />
          </View>
        </View>

        <View className="flex-row items-center gap-2 ">
          <View className="flex-row items-center justify-start  gap-0.5 bg-accent/10 px-2 py-1 rounded-full border border-accent/30">
            <Text className="text-accent  font-semibold ">
              {course?.price === 0 ? "বিনামূল্যে" : `${course?.price}`}
            </Text>
            {course?.price !== 0 && (
              <Text className="text-accent  font-semibold text-sm">
                {t("taka")}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* counts + actions */}
      <View className="mt-3">
        <View className="px-4 py-2 border-b border-border dark:border-dark-border">
          <PostCountLeft
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
          />
        </View>

        <View className="px-4  flex-row items-center justify-between">
          <View className="flex-row items-center gap-6">
            <LikeButton postId={post._id} initialLiked={post.isReacted} />

            <CommentsButton
              onClick={() => open(<CommentSheet postId={post._id} />)}
            />

            <ShareButton />
          </View>
          <TouchableOpacity
            onPress={() =>
              open(
                <PostThreeDotMenu
                  postId={post._id}
                  postAuthorId={userid._id}
                />,
              )
            }
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CourseCardFeed;
