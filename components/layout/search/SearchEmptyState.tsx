import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, View } from "react-native";

interface Props {
  icon: string;
  message: string;
}

export default function SearchEmptyState({ icon, message }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 items-center justify-center pt-20 gap-2.5">
      <Ionicons
        name={icon as any}
        size={44}
        color={isDark ? "#2e2e2e" : "#E5E7EB"}
      />
      <Text className="text-[13px] text-text-tertiary dark:text-dark-text-tertiary">
        {message}
      </Text>
    </View>
  );
}
