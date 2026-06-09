import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import PostCountLeft from "./PostCountLeft";
import PostProfileTop from "./PostProfileTop";

import type { Post } from "@/types/postTypes";

import { useTranslation } from "react-i18next";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";
import BookmarkButton from "../../buttons/BookmarkButton";
import CommentsButton from "../../buttons/CommentsButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";
import CommentSheet from "../../comments/CommentSheet";
import ImageSlider from "./ImageSlider";
import PostVideo from "./PostVideo";

interface Props {
  post: Post;
  isVideoVisible?: boolean;
  isVideoNearVisible?: boolean; // নতুন
}

const screenWidth = Dimensions.get("window").width;
const maxImageSize = screenWidth - 0;

const DynamicImage = ({
  uri,
  onPress,
}: {
  uri: string;
  onPress: () => void;
}) => {
  const [imageHeight, setImageHeight] = useState<number>(screenWidth);

  useEffect(() => {
    Image.getSize(
      uri,
      (width, height) => {
        const aspectRatio = height / width;
        const calculatedHeight = screenWidth * aspectRatio;
        const clampedHeight = Math.min(
          Math.max(calculatedHeight, screenWidth * 0.5),
          500,
        );
        setImageHeight(clampedHeight);
      },
      () => {},
    );
  }, [uri]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri }}
        style={{ width: screenWidth, height: imageHeight, borderRadius: 0 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const Postcard = ({
  post,
  isVideoVisible = false,
  isVideoNearVisible = false,
}: Props) => {
  const router = useRouter();
  const { userid, content, createdAt } = post;
  const [expanded, setExpanded] = useState(false);
  const { open } = useBottomSheet();

  const handleGoToPost = () => {
    router.push(`/post/${post._id}` as any);
  };

  const mediaList: string[] = Array.isArray(content?.media)
    ? (content.media as string[])
    : [];

  const { t } = useTranslation();

  const renderMedia = () => {
    if ((content as any)?.type === "video" && mediaList.length > 0) {
      return (
        <PostVideo
          uri={mediaList[0]}
          isVisible={isVideoVisible}
          isNearVisible={isVideoNearVisible} // পাঠাও
          videoMeta={(content as any)?.videoMeta}
        />
      );
    }

    if (mediaList.length === 1) {
      return <DynamicImage uri={mediaList[0]} onPress={handleGoToPost} />;
    }

    return <ImageSlider images={mediaList} />;
  };

  return (
    <View className="bg-background dark:bg-dark-background pt-4">
      <PostProfileTop user={userid} createdAt={createdAt} postId={post._id} />

      <View>
        {content?.title && (
          <Text className="mt-2 px-4 text-text dark:text-dark-text font-semibold text-base">
            {content.title}
          </Text>
        )}

        {content?.text && (
          <View className="mt-1.5 px-4">
            <Text
              className="text-text dark:text-dark-text text-base leading-6"
              numberOfLines={expanded ? undefined : 3}
            >
              {content.text}
            </Text>
            {content.text.length > 200 && (
              <TouchableOpacity onPress={() => setExpanded((prev) => !prev)}>
                <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary font-medium py-1 mt-1">
                  {expanded ? t("showLess") : t("readMore")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {mediaList.length > 0 && (
          <View className="w-full mt-2">{renderMedia()}</View>
        )}

        {/* counts */}
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-border dark:border-dark-border">
          <PostCountLeft
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
          />
        </View>

        {/* actions */}
        <View className="px-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-6">
            <LikeButton postId={post._id} initialLiked={post.isReacted} />
            <CommentsButton
              onClick={() => open(<CommentSheet postId={post._id} />)}
            />
            <ShareButton />
          </View>
          <BookmarkButton postId={post._id} />
        </View>
      </View>
    </View>
  );
};

export default Postcard;
