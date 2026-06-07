import { useDeleteCommentMutation } from "@/redux/api/commentsApi";
import { useAppSelector } from "@/redux/hooks";
import type { Comment } from "@/types/commentsTypes";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TimeAgo from "../datetime/TimeAgo";

interface Props {
  comment: Comment;
  onReply?: (comment: Comment) => void;
}

const CommentCard = ({ comment, onReply }: Props) => {
  const router = useRouter();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwn = currentUserId === comment.commentUserId._id;
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const handleDelete = async () => {
    try {
      await deleteComment({
        commentId: comment._id,
        postId: comment.postId,
        parentCommentId: comment.parentCommentId,
      }).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const user = comment.commentUserId;

  return (
    <View className="flex-row gap-2.5 py-2.5">
      {/* Avatar */}
      <TouchableOpacity
        onPress={() => router.push(`/${user.username}` as any)}
        className="w-9 h-9 rounded-full overflow-hidden bg-accent/20 border border-border dark:border-dark-border flex-shrink-0"
      >
        {user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-accent font-bold text-base">
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View className="flex-1">
        {/* Bubble */}
        <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl rounded-tl-sm px-3 py-2.5">
          <Text className="text-xs font-semibold text-text dark:text-dark-text mb-0.5">
            {user.name}
          </Text>
          <Text className="text-sm text-text dark:text-dark-text leading-snug">
            {comment.text}
          </Text>
        </View>

        {/* Actions row */}
        <View className="flex-row items-center gap-4 mt-1.5 px-1">
          <TimeAgo
            date={comment.createdAt}
            className="text-xs text-text-tertiary dark:text-dark-text-tertiary"
          />

          {onReply && (
            <TouchableOpacity onPress={() => onReply(comment)}>
              <Text className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">
                উত্তর দিন
              </Text>
            </TouchableOpacity>
          )}

          {isOwn && (
            <TouchableOpacity onPress={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-xs font-semibold text-red-400">
                  মুছুন
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
