import { useDeleteCommentMutation } from "@/redux/api/commentsApi";
import { useAppSelector } from "@/redux/hooks";
import type { Comment } from "@/types/commentsTypes";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GreenMark from "../badges/GreenMark";
import TimeAgo from "../datetime/TimeAgo";

interface Props {
  comment: Comment;
  onReply?: (comment: Comment) => void;
}

const CommentCard = ({ comment, onReply }: Props) => {
  const router = useRouter();

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
    <View className="flex-row gap-2.5 px-4 py-3 bg-background dark:bg-dark-background">
      {/* Avatar */}
      <TouchableOpacity
        onPress={() => router.push(`/${user.username}` as any)}
        activeOpacity={0.8}
        className="w-9 h-9 rounded-full overflow-hidden bg-accent/10 border border-border dark:border-dark-border flex-shrink-0 mt-0.5"
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
        {/* Bubble */}
        <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl rounded-tl-none px-3.5 py-2.5 border border-border/40 dark:border-dark-border/30">
          {/* Name */}
          <View className="flex-row items-center justify-between mb-1">
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

              {isOwn && (
                <View className="px-1.5 py-0.5 rounded-full bg-accent/10">
                  <Text className="text-[10px] font-medium text-accent">
                    আপনি
                  </Text>
                </View>
              )}
            </View>

            {/* DELETE ICON (top-right, clean) */}
            {isOwn && (
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                className="w-7 h-7 items-center justify-center rounded-full bg-red-500/10"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="red" />
                ) : (
                  <MaterialIcons
                    name="delete-outline"
                    size={20}
                    color="black"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Text */}
          <Text className="text-sm text-text dark:text-dark-text leading-relaxed">
            {comment.text}
          </Text>
        </View>

        {/* Meta row (reply + time inline clean) */}
        <View className="flex-row items-center gap-3 mt-1.5 px-1">
          <TimeAgo
            date={comment.createdAt}
            className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary"
          />

          {onReply && (
            <>
              <View className="w-0.5 h-0.5 rounded-full bg-text-tertiary dark:bg-dark-text-tertiary" />

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
        </View>
      </View>
    </View>
  );
};

export default CommentCard;
