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
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: "#F3F4F6",
          borderRadius: 99,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="মন্তব্য লিখুন..."
          placeholderTextColor="#9CA3AF"
          style={{
            flex: 1,
            fontSize: 14,
            color: "#111827",
            paddingVertical: 0,
          }}
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
