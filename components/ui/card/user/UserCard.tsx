import type { SearchUser } from "@/redux/api/others/searchApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Props {
  user: SearchUser;
}

export default function UserCard({ user }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/profile/${user.username}` as any)}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#F3F4F6",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {user.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            style={{ width: 44, height: 44 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#6B7280" }}>
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </Text>
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
        >
          {user.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}
        >
          {user.username}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
