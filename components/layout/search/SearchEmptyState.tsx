import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface Props {
  icon: string;
  message: string;
}

export default function SearchEmptyState({ icon, message }: Props) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        gap: 10,
      }}
    >
      <Ionicons name={icon as any} size={44} color="#E5E7EB" />
      <Text style={{ fontSize: 13, color: "#9CA3AF" }}>{message}</Text>
    </View>
  );
}
