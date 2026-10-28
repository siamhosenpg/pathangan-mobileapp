import { useBottomSheet } from "@/components/ui/bottom-sheet/BottomSheetProvider";

import { useDeleteCommentMutation } from "@/redux/api/commentsApi";
import type { Comment } from "@/types/commentsTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReportSheet from "../bottom-sheet/report/ReportSheet";

interface Props {
  comment: Comment;
  isOwn: boolean;
  // user delete হয়ে গেলে true, তখন Report দেখানো হবে না
  isDeletedUser?: boolean;
  // নিজের comment হলে edit mode চালু করার জন্য (CommentSheet এর input এ)
  onEdit?: (comment: Comment) => void;
}

const CommentMenuSheet = ({
  comment,
  isOwn,
  isDeletedUser = false,
  onEdit,
}: Props) => {
  const { close, replace } = useBottomSheet();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f1f1f1" : "#1b1b1b";

  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  // টেক্সট কপি — শুধু menu বন্ধ হবে, comment sheet নিচেই থাকবে
  const handleCopyText = async () => {
    await Clipboard.setStringAsync(comment.text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    close();
    setTimeout(() => {
      Alert.alert(t("commentData.textCopied"));
    }, 300);
  };

  // menu বন্ধ হওয়ার animation শেষ হলে comment sheet এর input এ edit mode চালু হবে
  const handleEdit = () => {
    close();
    setTimeout(() => onEdit?.(comment), 260);
  };

  // menu এর জায়গায় ReportSheet বসবে; report শেষে close() করলে comment sheet ফিরে আসবে
  const handleReport = () => {
    replace(<ReportSheet targetType="comment" targetId={comment._id} />, {
      scrollable: false,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t("commentData.deleteTitle"),
      t("commentData.deleteMessage"),
      [
        { text: t("commentData.cancel"), style: "cancel" },
        {
          text: t("commentData.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment({
                commentId: comment._id,
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
              }).unwrap();
              close();
            } catch (err) {
              Alert.alert(t("commentData.deleteFailed"), getErrorMessage(err));
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View className="px-4 pb-2 gap-1">
      <View className="items-center pb-3">
        <Text className="text-base font-bold text-text dark:text-dark-text">
          {t("commentData.options")}
        </Text>
      </View>

      {/* নিজের comment হলে Edit */}
      {isOwn && onEdit && (
        <TouchableOpacity
          onPress={handleEdit}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
        >
          <View className="w-9 h-9 rounded-full items-center justify-center bg-accent/10">
            <Ionicons name="create-outline" size={18} color="#00914d" />
          </View>
          <Text className="flex-1 text-sm font-medium text-text dark:text-dark-text">
            {t("commentData.edit")}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleCopyText}
        activeOpacity={0.7}
        className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
      >
        <View className="w-9 h-9 rounded-full items-center justify-center bg-gray-500/10 dark:bg-gray-400/10">
          <Ionicons name="copy-outline" size={18} color={iconColor} />
        </View>
        <Text className="flex-1 text-sm font-medium text-text dark:text-dark-text">
          {t("commentData.copyText")}
        </Text>
      </TouchableOpacity>

      {/* অন্যের comment হলে Report (deleted user এর comment হলে নয়) */}
      {!isOwn && !isDeletedUser && (
        <TouchableOpacity
          onPress={handleReport}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
        >
          <View className="w-9 h-9 rounded-full items-center justify-center bg-red-500/10">
            <Ionicons name="flag-outline" size={18} color="#ef4444" />
          </View>
          <Text className="flex-1 text-sm font-medium text-red-500">
            {t("commentData.report")}
          </Text>
        </TouchableOpacity>
      )}

      {/* নিজের comment হলে Delete */}
      {isOwn && (
        <TouchableOpacity
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-background-secondary dark:active:bg-dark-background-secondary"
        >
          <View className="w-9 h-9 rounded-full items-center justify-center bg-red-500/10">
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            )}
          </View>
          <Text className="flex-1 text-sm font-medium text-red-500">
            {t("commentData.delete")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CommentMenuSheet;
