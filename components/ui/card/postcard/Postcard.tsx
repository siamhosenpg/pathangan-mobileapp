import type { Post } from "@/types/postTypes";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

import ModerationNotice from "./ModerationNotice";
import PostCountLeft from "./PostCountLeft";
import PostProfileTop from "./PostProfileTop";

import { useTranslation } from "react-i18next";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";
import BookmarkButton from "../../buttons/BookmarkButton";
import CommentsButton from "../../buttons/CommentsButton";
import LikeButton from "../../buttons/LikeButton";
import ShareButton from "../../buttons/ShareButton";
import CommentSheet from "../../comments/CommentSheet";
import TextFont from "../../font/TextFont";
import PostImage from "./PostImage";
import PostVideo from "./PostVideo";

interface Props {
  post: Post;
  isVideoVisible?: boolean;
  isVideoNearVisible?: boolean; // নতুন
}

// মিডিয়া (ছবি/ভিডিও) থাকলে টেক্সট কত character এর পর truncate হবে
const TEXT_TRUNCATE_LENGTH_WITH_MEDIA = 120;

// মিডিয়া না থাকলে টেক্সট কত character এর পর truncate হবে
const TEXT_TRUNCATE_LENGTH_NO_MEDIA = 300;

const Postcard = ({
  post,
  isVideoVisible = false,
  isVideoNearVisible = false,
}: Props) => {
  const { userid, content, createdAt } = post;
  const [expanded, setExpanded] = useState(false);
  const { open } = useBottomSheet();

  const mediaList: string[] = Array.isArray(content?.media)
    ? (content.media as string[])
    : [];

  const { t } = useTranslation();

  // মিডিয়া আছে কিনা চেক
  const hasMedia = mediaList.length > 0;

  // মিডিয়া থাকলে 120, না থাকলে 300
  const truncateLength = hasMedia
    ? TEXT_TRUNCATE_LENGTH_WITH_MEDIA
    : TEXT_TRUNCATE_LENGTH_NO_MEDIA;

  // টেক্সট truncate করার দরকার আছে কিনা চেক
  const fullText = content?.text ?? "";
  const isLongText = fullText.length > truncateLength;
  const displayText =
    !expanded && isLongText
      ? fullText.slice(0, truncateLength).trimEnd()
      : fullText;

  const renderMedia = () => {
    if ((content as any)?.type === "video" && mediaList.length > 0) {
      return (
        <PostVideo
          postId={post._id}
          uri={mediaList[0]}
          isVisible={isVideoVisible}
          isNearVisible={isVideoNearVisible} // পাঠাও
          videoMeta={(content as any)?.videoMeta}
        />
      );
    }

    return <PostImage images={mediaList} postId={post._id} />;
  };

  return (
    <View className="bg-background dark:bg-dark-background pt-4  border-b border-border dark:border-dark-border">
      {/* hidden হলে মালিককে কারণ দেখানো হবে (অন্যদের কাছে notice আসে না) */}
      <ModerationNotice notice={post.moderationNotice} />

      <PostProfileTop user={userid} createdAt={createdAt} postId={post._id} />

      <View>
        {content?.title && (
          <TextFont
            className={`mt-2 px-4 text-text dark:text-dark-text text-base ${content.text ? "font-semibold" : "font-medium"}`}
          >
            {content.title}
          </TextFont>
        )}

        {content?.text && (
          <View className="mt-1.5 px-4">
            <TextFont className="text-text font-medium dark:text-dark-text text-base leading-6">
              {displayText}
              {!expanded && isLongText && (
                <>
                  <TextFont className="text-text dark:text-dark-text">
                    {"... "}
                  </TextFont>
                  <TextFont
                    className="text-text-tertiary dark:text-dark-text-tertiary font-semibold"
                    onPress={() => setExpanded(true)}
                  >
                    {t("readMore")}
                  </TextFont>
                </>
              )}
            </TextFont>

            {expanded && isLongText && (
              <TouchableOpacity onPress={() => setExpanded(false)}>
                <TextFont className="text-text-tertiary dark:text-dark-text-tertiary font-semibold py-1 mt-1">
                  {t("showLess")}
                </TextFont>
              </TouchableOpacity>
            )}
          </View>
        )}

        {hasMedia && <View className="w-full mt-2">{renderMedia()}</View>}

        {/* counts */}
        <View className="flex-row items-center justify-between px-4 py-1.5 border-b  border-border/50 dark:border-dark-border/50">
          <PostCountLeft
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
            viewsCount={post.viewsCount}
          />
        </View>

        {/* actions */}
        <View className="px-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-6">
            <LikeButton postId={post._id} initialLiked={post.isReacted} />
            <CommentsButton
              onClick={() => open(<CommentSheet postId={post._id} />)}
            />
            <ShareButton postId={post._id} title={content?.title} />
          </View>
          <BookmarkButton postId={post._id} />
        </View>
      </View>
    </View>
  );
};

export default Postcard;
