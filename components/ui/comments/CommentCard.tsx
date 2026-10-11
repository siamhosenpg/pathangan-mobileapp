import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";
import { useGetRepliesByCommentQuery } from "@/redux/api/commentsApi";
import { useAppSelector } from "@/redux/hooks";
import type { Comment } from "@/types/commentsTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GreenMark from "../badges/GreenMark";
import TimeAgo from "../datetime/TimeAgo";
import CommentMenuSheet from "./CommentMenuSheet";

const REPLIES_PAGE_SIZE = 5;
const REPLY_INDENT = 66; // root avatar (48) + gap + padding

export interface ExpandRequest {
  rootId: string;
  nonce: number;
}

// ===================== একটা comment / reply =====================
interface ItemProps {
  comment: Comment;
  isReply?: boolean;
  parentAuthorId?: string;
  onReply?: (comment: Comment) => void;
  onReopen?: () => void;
}

const CommentItem = ({
  comment,
  isReply = false,
  parentAuthorId,
  onReply,
  onReopen,
}: ItemProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { open } = useBottomSheet();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const currentUser = useAppSelector((state) => state.auth.user);

  const currentUserId = currentUser?.id || (currentUser as any)?._id;
  const user = comment.commentUserId;
  const isOwn = !!currentUserId && currentUserId === user._id;
  const initials = user.name?.charAt(0).toUpperCase() ?? "?";

  // root এর লেখক ছাড়া অন্য কাউকে reply করলে তবেই @mention দেখাবে
  const mention =
    comment.replyToUserId && comment.replyToUserId._id !== parentAuthorId
      ? comment.replyToUserId
      : null;

  const openMenu = () => {
    open(
      <CommentMenuSheet comment={comment} isOwn={isOwn} onBack={onReopen} />,
    );
  };

  return (
    <View className={`flex-row gap-2.5 py-2 ${isReply ? "" : "px-2"}`}>
      {/* Avatar */}
      <TouchableOpacity
        onPress={() => router.push(`/${user.username}` as any)}
        activeOpacity={0.8}
        className={`${
          isReply ? "w-8 h-8" : "w-12 h-12"
        } rounded-full overflow-hidden bg-accent/10 border border-border dark:border-dark-border flex-shrink-0 mt-0.5`}
      >
        {user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-accent/15">
            <Text className="text-accent font-bold text-sm">{initials}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View className="flex-1">
        {/* নাম + ৩ ডট */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-1 pr-2">
            <Text
              className="text-sm font-semibold text-text dark:text-dark-text flex-shrink"
              numberOfLines={1}
            >
              {user.name}
            </Text>
            <GreenMark mark={user.greenmarkVerified || false} size={14} />
          </View>

          <TouchableOpacity
            onPress={openMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        {/* Text */}
        <Text className="text-base text-text py-0.5 dark:text-dark-text leading-relaxed">
          {mention && (
            <Text className="text-accent font-semibold">@{mention.name} </Text>
          )}
          {comment.text}
        </Text>

        {/* Meta row */}
        <View className="flex-row items-center gap-4">
          <TimeAgo
            date={comment.createdAt}
            className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary"
          />

          {onReply && (
            <TouchableOpacity
              onPress={() => onReply(comment)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text className="text-[11px] font-semibold text-accent">
                {t("commentData.reply")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// ===================== replies তালিকা =====================
interface RepliesListProps {
  rootId: string;
  parentAuthorId: string;
  onReply?: (comment: Comment) => void;
  onReopen?: () => void;
}

const RepliesList = ({
  rootId,
  parentAuthorId,
  onReply,
  onReopen,
}: RepliesListProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetRepliesByCommentQuery({
      commentId: rootId,
      page,
      limit: REPLIES_PAGE_SIZE,
    });

  const replies = data?.data ?? [];

  return (
    <View>
      {isLoading && (
        <View className="py-3 items-start">
          <ActivityIndicator size="small" color="#00914d" />
        </View>
      )}

      {replies.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          isReply
          parentAuthorId={parentAuthorId}
          onReply={onReply}
          onReopen={onReopen}
        />
      ))}

      {/* error */}
      {isError && (
        <TouchableOpacity
          onPress={() => refetch()}
          className="py-2 flex-row items-center gap-2"
        >
          <Ionicons name="refresh" size={14} color="#00914d" />
          <Text className="text-xs font-semibold text-accent">
            {t("commentData.repliesLoadFailed")} · {t("commentData.retry")}
          </Text>
        </TouchableOpacity>
      )}

      {/* আরও reply */}
      {!isError && !isLoading && data?.hasMore && (
        <TouchableOpacity
          onPress={() => setPage((p) => p + 1)}
          disabled={isFetching}
          className="py-2 flex-row items-center gap-2"
        >
          {isFetching ? (
            <ActivityIndicator size="small" color="#00914d" />
          ) : (
            <Text className="text-xs font-semibold text-accent">
              {t("commentData.loadMoreReplies")}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// ===================== root comment + thread =====================
interface Props {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  onReopen?: () => void;
  expandRequest?: ExpandRequest | null;
}

const CommentCard = ({ comment, onReply, onReopen, expandRequest }: Props) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const repliesCount = comment.repliesCount ?? 0;

  // reply দেওয়ার পর thread নিজে থেকে খুলে যাবে
  useEffect(() => {
    if (expandRequest && expandRequest.rootId === comment._id) {
      setExpanded(true);
    }
  }, [expandRequest, comment._id]);

  return (
    <View className="border-b border-border/20 dark:border-dark-border/20">
      <CommentItem comment={comment} onReply={onReply} onReopen={onReopen} />

      {repliesCount > 0 && (
        <View style={{ paddingLeft: REPLY_INDENT }}>
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
            className="flex-row items-center gap-2 py-1.5"
          >
            <View className="w-6 h-px bg-border dark:bg-dark-border" />
            <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
              {expanded
                ? t("commentData.hideReplies")
                : t("commentData.viewReplies", { count: repliesCount })}
            </Text>
          </TouchableOpacity>

          {expanded && (
            <RepliesList
              rootId={comment._id}
              parentAuthorId={comment.commentUserId._id}
              onReply={onReply}
              onReopen={onReopen}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default CommentCard;
