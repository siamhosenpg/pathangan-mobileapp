import type { SearchUser } from "@/redux/api/others/searchApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  user: SearchUser;
}

export default function UserCard({ user }: Props) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/profile/${user.username}` as any)}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-4 py-3 bg-background dark:bg-dark-background border-b border-background-secondary dark:border-dark-border"
    >
      {/* Avatar */}
      <View className="w-11 h-11 rounded-full bg-background-secondary dark:bg-dark-background-secondary overflow-hidden items-center justify-center shrink-0">
        {user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            className="w-11 h-11"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-lg font-semibold text-text-tertiary dark:text-dark-text-tertiary">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </Text>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text
          numberOfLines={1}
          className="text-sm font-semibold text-text dark:text-dark-text"
        >
          {user.name}
        </Text>
        <Text
          numberOfLines={1}
          className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5"
        >
          {user.username}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={isDark ? "#2e2e2e" : "#D1D5DB"}
      />
    </TouchableOpacity>
  );
}
