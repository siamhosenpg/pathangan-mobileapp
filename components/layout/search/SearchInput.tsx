import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-row items-center bg-background-secondary dark:bg-dark-background-secondary rounded-full px-3.5 py-2.5 gap-2">
      <Ionicons
        name="search-outline"
        size={16}
        color={isDark ? "#8a8a8a" : "#9CA3AF"}
      />

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder="তথ্য অনুসন্ধান করুন"
        placeholderTextColor={isDark ? "#8a8a8a" : "#9CA3AF"}
        className="flex-1 text-sm text-text dark:text-dark-text"
        style={{ paddingVertical: 0 }}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={isDark ? "#8a8a8a" : "#9CA3AF"}
          />
        </TouchableOpacity>
      )}

      {value.trim().length > 0 && (
        <TouchableOpacity
          onPress={onSubmit}
          className="bg-accent rounded-full px-3 py-1.5"
        >
          <Text className="text-xs text-white font-semibold">খুঁজুন</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
