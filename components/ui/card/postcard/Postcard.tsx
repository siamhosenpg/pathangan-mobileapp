import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import PostCountLeft from "./PostCountLeft";
import PostProfileTop from "./PostProfileTop";

import type { Post } from "@/types/postTypes";
import { Ionicons } from "@expo/vector-icons";

import BookmarkButton from "../../buttons/BookmarkButton";
import CommentsButton from "../../buttons/CommentsButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";

interface Props {
  post: Post;
}

const screenWidth = Dimensions.get("window").width;
const maxImageSize = screenWidth - 0; // px-4 দুই পাশে

const Postcard = ({ post }: Props) => {
  const router = useRouter();
  const { userid, content, createdAt } = post;
  const [expanded, setExpanded] = useState(false);

  const handleGoToPost = () => {
    router.push(`/post/${post._id}` as any);
  };

  const mediaList: string[] = Array.isArray(content?.media)
    ? (content.media as string[])
    : [];

  return (
    <View className="bg-background pt-4 ">
      <PostProfileTop user={userid} createdAt={createdAt} postId={post._id} />

      <View>
        {content?.title && (
          <Text className="mt-2 px-4 text-text font-semibold text-base">
            {content.title}
          </Text>
        )}

        {content?.text && (
          <View className="mt-1.5 px-4">
            <Text
              className="text-text-secondary text-base leading-6"
              numberOfLines={expanded ? undefined : 4}
            >
              {content.text}
            </Text>
            {content.text.length > 200 && (
              <TouchableOpacity onPress={() => setExpanded((prev) => !prev)}>
                <Text className="text-sm text-gray-500 font-medium py-1 mt-1">
                  {expanded ? "আগের অবস্থায় আসুন" : "আরো পড়ুন"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* media */}
        {mediaList.length > 0 && (
          <View className="w-full mt-2 ">
            {(content as any)?.type === "video" ? (
              <View
                style={{ width: maxImageSize, height: maxImageSize }}
                className="bg-gray-800 items-center justify-center rounded-xl"
              >
                <Ionicons
                  name="play-circle-outline"
                  size={48}
                  color="#9CA3AF"
                />
              </View>
            ) : mediaList.length === 1 ? (
              // একটা image — square max, ছোট হলে ছোটই থাকবে
              <TouchableOpacity onPress={handleGoToPost} activeOpacity={0.9}>
                <Image
                  source={{ uri: mediaList[0] }}
                  style={{
                    width: maxImageSize,
                    height: maxImageSize,
                    borderRadius: 0,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              // একাধিক image — 2 column grid, প্রতিটা square
              <TouchableOpacity
                onPress={handleGoToPost}
                activeOpacity={0.9}
                style={{ gap: 2 }}
              >
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}
                >
                  {mediaList.map((url, i) => {
                    const itemSize = (maxImageSize - 2) / 2;
                    return (
                      <Image
                        key={i}
                        source={{ uri: url }}
                        style={{
                          width: itemSize,
                          height: itemSize,
                          borderRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    );
                  })}
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* counts */}
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b border-border ">
          <PostCountLeft
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
          />
        </View>

        {/* actions */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-6">
            <LikeButton postId={post._id} initialLiked={post.isReacted} />

            <CommentsButton onClick={handleGoToPost} />

            <ShareButton />
          </View>
          <BookmarkButton postId={post._id} />
        </View>
      </View>
    </View>
  );
};

export default Postcard;
