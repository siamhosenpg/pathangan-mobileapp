import { useDeleteCommentMutation } from "@/redux/api/commentsApi";
import { useAppSelector } from "@/redux/hooks";
import type { Comment } from "@/types/commentsTypes";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import GreenMark from "../badges/GreenMark";
import TimeAgo from "../datetime/TimeAgo";

interface Props {
  comment: Comment;
  onReply?: (comment: Comment) => void;
}

const CommentCard = ({ comment, onReply }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);

  const currentUserId = currentUser?.id || (currentUser as any)?._id;

  const commentUserId =
    typeof comment.commentUserId === "object"
      ? comment.commentUserId._id
      : comment.commentUserId;

  const isOwn = currentUserId === commentUserId;

  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const handleDelete = () => {
    Alert.alert(
      "মন্তব্য মুছবেন?",
      "এই মন্তব্যটি স্থায়ীভাবে মুছে যাবে।",
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "মুছুন",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment({
                commentId: comment._id,
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
              }).unwrap();
            } catch (err) {
              console.error("Delete failed:", err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const user = comment.commentUserId;
  const initials = user.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <View className="flex-row gap-2.5 px-2 py-2 border-b border-border/20 dark:border-dark-border/20">
      {/* Avatar */}
      <TouchableOpacity
        onPress={() => router.push(`/${user.username}` as any)}
        activeOpacity={0.8}
        className="w-12 h-12 rounded-full overflow-hidden bg-accent/10 border border-border dark:border-dark-border flex-shrink-0 mt-0.5"
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
      <View className="flex-1 mt-1">
        {/* Bubble */}
        <View className=" ">
          {/* Name */}
          <View className="flex-row items-center justify-between ">
            <View className="flex-row items-center gap-1.5">
              <View>
                <Text
                  className="text-sm font-semibold text-text dark:text-dark-text"
                  numberOfLines={1}
                >
                  {user.name}
                </Text>
                <GreenMark mark={user.greenmarkVerified || false} size={18} />
              </View>
            </View>
          </View>

          {/* Text */}
          <Text className="text-base text-text py-0.5 dark:text-dark-text leading-relaxed ">
            {comment.text}
          </Text>
        </View>

        {/* Meta row (reply + time inline clean) */}
        <View className="flex-row items-center gap-3 ">
          <TimeAgo
            date={comment.createdAt}
            className="text-[11px] font-medium text-text-tertiary dark:text-dark-text-tertiary"
          />

          {onReply && (
            <>
              <TouchableOpacity
                onPress={() => onReply(comment)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text className="text-[11px] font-semibold text-accent">
                  উত্তর দিন
                </Text>
              </TouchableOpacity>
            </>
          )}
          {/* DELETE ICON (top-right, clean) */}
          {isOwn && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              className=" "
            >
              {isDeleting ? (
                <Text className="text-sm font-medium text-text-tertiary dark:text-dark-text-tertiary">
                  {t("deleteing")}
                </Text>
              ) : (
                <Text className="text-sm font-medium text-red-600">
                  {t("delete")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CommentCard;
