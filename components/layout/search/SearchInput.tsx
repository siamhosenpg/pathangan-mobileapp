import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export default function SearchInput({
  value,
  onChangeText,
  onSubmit,
  onClear,
}: Props) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 99,
        paddingHorizontal: 14,
        paddingVertical: 9,
        gap: 8,
      }}
    >
      <Ionicons name="search-outline" size={16} color="#9CA3AF" />

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder="তথ্য অনুসন্ধান করুন"
        placeholderTextColor="#9CA3AF"
        style={{
          flex: 1,
          fontSize: 14,
          color: "#111827",
          paddingVertical: 0,
        }}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      )}

      {value.trim().length > 0 && (
        <TouchableOpacity
          onPress={onSubmit}
          style={{
            backgroundColor: "#00914d",
            borderRadius: 99,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>
            খুঁজুন
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
