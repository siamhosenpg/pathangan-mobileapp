import type { Comment } from "@/types/commentsTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useRef } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  replyingTo?: Comment | null;
  onCancelReply?: () => void;
}

const CommentFeedInput = ({
  value,
  onChangeText,
  onSubmit,
  isLoading,
  replyingTo,
  onCancelReply,
}: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="border-t border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 pt-2 pb-4">
      {/* Reply indicator */}
      {replyingTo && (
        <View className="flex-row items-center justify-between bg-accent/10 rounded-xl px-3 py-1.5 mb-2">
          <Text className="text-xs text-accent font-medium" numberOfLines={1}>
            ↩ {replyingTo.commentUserId.name} কে উত্তর দিচ্ছেন
          </Text>
          <TouchableOpacity onPress={onCancelReply} hitSlop={8}>
            <Ionicons name="close" size={16} color="#00914d" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input row */}
      <View className="flex-row items-end gap-2">
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={replyingTo ? "উত্তর লিখুন..." : "মন্তব্য লিখুন..."}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          scrollEnabled
          className="flex-1 text-sm text-text dark:text-dark-text bg-background-secondary dark:bg-dark-background-secondary rounded-2xl px-4 py-2.5"
          style={{ maxHeight: 100, minHeight: 42 }}
        />

        <TouchableOpacity
          onPress={onSubmit}
          disabled={!value.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-accent items-center justify-center flex-shrink-0"
          style={{ opacity: !value.trim() || isLoading ? 0.4 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentFeedInput;
