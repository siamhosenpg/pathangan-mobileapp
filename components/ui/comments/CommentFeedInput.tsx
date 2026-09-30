import type { Comment } from "@/types/commentsTypes";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  maxLength?: number;
}

const ACCENT = "#00914d";

const CommentFeedInput = ({
  value,
  onChangeText,
  onSubmit,
  isLoading,
  replyingTo,
  onCancelReply,
  maxLength = 500,
}: Props) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const canSend = value.trim().length > 0 && !isLoading;
  const showCounter = value.length >= maxLength * 0.8;
  const isNearLimit = value.length >= maxLength * 0.95;

  // Send button scale animation
  const scale = useRef(new Animated.Value(canSend ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: canSend ? 1 : 0.92,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [canSend, scale]);

  // Auto focus when user taps reply
  useEffect(() => {
    if (replyingTo) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [replyingTo]);

  return (
    <View className="border-t border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 pt-2.5 pb-4">
      {/* Reply indicator */}
      {replyingTo && (
        <View className="flex-row items-center bg-accent/10 rounded-xl mb-2.5 overflow-hidden">
          <View className="w-1 self-stretch bg-accent" />

          <View className="flex-1 flex-row items-center px-3 py-2">
            <Ionicons
              name="return-down-forward"
              size={16}
              color={ACCENT}
              style={{ marginRight: 8 }}
            />
            <View className="flex-1">
              <Text className="text-[10px] text-text-secondary dark:text-dark-text-secondary">
                উত্তর দিচ্ছেন
              </Text>
              <Text
                className="text-xs text-accent font-semibold"
                numberOfLines={1}
              >
                {replyingTo.commentUserId.name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onCancelReply}
            hitSlop={10}
            activeOpacity={0.7}
            className="w-6 h-6 rounded-full bg-accent/15 items-center justify-center mr-2"
          >
            <Ionicons name="close" size={14} color={ACCENT} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input row */}
      <View
        className={`flex-row items-end rounded-full border pl-4 pr-1.5 py-1.5 bg-background-secondary dark:bg-dark-background-secondary ${
          isFocused ? "border-accent" : "border-border dark:border-dark-border"
        }`}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={replyingTo ? "উত্তর লিখুন..." : "মন্তব্য লিখুন..."}
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          selectionColor={ACCENT}
          cursorColor={ACCENT}
          maxLength={maxLength}
          multiline
          textAlignVertical="center"
          scrollEnabled
          className="flex-1  text-text dark:text-dark-text py-2"
          style={{
            maxHeight: 110,
            minHeight: 36,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        />

        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={!canSend}
            activeOpacity={0.8}
            className={`w-11 h-11 rounded-full items-center justify-center ml-2 ${
              canSend ? "bg-accent" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={19} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Character counter */}
      {showCounter && (
        <Text
          className={`text-[10px] text-right mt-1 mr-2 ${
            isNearLimit
              ? "text-red-500"
              : "text-text-secondary dark:text-dark-text-secondary"
          }`}
        >
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

export default CommentFeedInput;
