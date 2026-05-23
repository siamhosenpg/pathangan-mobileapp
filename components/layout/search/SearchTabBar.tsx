import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type SearchTab = "all" | "posts" | "accounts";

export const TABS: { key: SearchTab; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "posts", label: "পোস্ট" },
  { key: "accounts", label: "অ্যাকাউন্ট" },
];

interface Props {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
}

export default function SearchTabBar({ activeTab, onTabChange }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        paddingHorizontal: 16,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            style={{
              paddingVertical: 13,
              paddingHorizontal: 6,
              marginRight: 20,
              borderBottomWidth: 2,
              borderBottomColor: isActive ? "#00914d" : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#00914d" : "#6B7280",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
