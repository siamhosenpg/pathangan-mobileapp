import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import BookmarkButton from "@/components/ui/buttons/BookmarkButton";
import CommentsButton from "@/components/ui/buttons/CommentsButton";
import LikeButton from "@/components/ui/buttons/LikeButton";
import ShareButton from "@/components/ui/buttons/ShareButton";
import PostCountLeft from "@/components/ui/card/postcard/PostCountLeft";
import PostProfileTop from "@/components/ui/card/postcard/PostProfileTop";

interface Props {
  post: Post;
  onCommentPress?: () => void;
}

export default function PostPageLeft({ post, onCommentPress }: Props) {
  const { userid, content, createdAt } = post;
  const [expanded, setExpanded] = useState(false);

  const isLongText = (content?.text?.length ?? 0) > 300;
  const mediaList: string[] = Array.isArray(content?.media)
    ? (content.media as string[])
    : [];

  return (
    <View className="bg-background dark:bg-dark-background overflow-hidden">
      {/* Profile top */}
      <View className="pt-4 px-1">
        <PostProfileTop user={userid} createdAt={createdAt} postId={post._id} />
      </View>

      {/* Title */}
      {content?.title ? (
        <Text className="mt-3 px-4  font-semibold text-text dark:text-dark-text">
          {content.title}
        </Text>
      ) : null}

      {/* Text */}
      {content?.text ? (
        <View className="mt-2 px-4">
          <Text
            numberOfLines={expanded ? undefined : isLongText ? 4 : undefined}
            className="text-base text-text-secondary dark:text-dark-text-secondary leading-[21px]"
          >
            {content.text}
          </Text>
          {isLongText && (
            <TouchableOpacity
              onPress={() => setExpanded((p) => !p)}
              className="mt-1"
            >
              <Text className="text-[13px] text-text-tertiary dark:text-dark-text-tertiary font-semibold">
                {expanded ? "আগের অবস্থায় আসুন" : "আরো পড়ুন"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Media */}
      {mediaList.length > 0 ? (
        <View className="mt-3">
          {content?.type === "video" ? (
            <View className="w-full  aspect-square bg-foreground dark:bg-dark-foreground items-center justify-center">
              <Ionicons name="play-circle-outline" size={48} color="#9CA3AF" />
            </View>
          ) : mediaList.length === 1 ? (
            <Image
              source={{ uri: mediaList[0] }}
              className="w-full aspect-square "
              resizeMode="cover"
            />
          ) : (
            <View className="flex-row flex-wrap gap-[1px]">
              {mediaList.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  className="w-full h-full aspect-square"
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* counts */}
      <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-border dark:border-dark-border ">
        <PostCountLeft
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          sharesCount={post.sharesCount}
        />
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between px-4  ">
        <View className="flex-row items-center gap-5">
          <LikeButton postId={post._id} initialLiked={post.isReacted} />
          <CommentsButton onClick={onCommentPress} />
          <ShareButton />
        </View>
        {post._id && <BookmarkButton postId={post._id} />}
      </View>
    </View>
  );
}
