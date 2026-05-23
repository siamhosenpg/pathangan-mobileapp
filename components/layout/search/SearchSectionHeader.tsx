import React from "react";
import { Text, View } from "react-native";

interface Props {
  title: string;
  count: number;
}

export default function SearchSectionHeader({ title, count }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: "#F9FAFB",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: "#374151",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#E5E7EB",
          borderRadius: 99,
          paddingHorizontal: 6,
          paddingVertical: 1,
        }}
      >
        <Text style={{ fontSize: 10, color: "#6B7280", fontWeight: "600" }}>
          {count}
        </Text>
      </View>
    </View>
  );
}
