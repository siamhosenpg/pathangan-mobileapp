import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  onSubmit?: (text: string) => void;
}

export default function CommentInput({ onSubmit }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit?.(text.trim());
    setText("");
  };

  return (
    <View className="px-4 py-2.5 border-t border-border dark:border-dark-border bg-background dark:bg-dark-background">
      <View className="flex-row items-center gap-2.5 bg-background-secondary dark:bg-dark-background-secondary rounded-full px-4 py-2.5">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="মন্তব্য লিখুন..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-sm text-text dark:text-dark-text py-0"
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim()}
          style={{ opacity: text.trim() ? 1 : 0.3 }}
        >
          <Ionicons name="send" size={18} color="#00914d" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
