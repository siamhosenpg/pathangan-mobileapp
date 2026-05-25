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
    <View className="flex-row bg-background dark:bg-dark-background border-b border-background-secondary dark:border-dark-border px-4">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            className={`py-3.5 px-1.5 mr-5 border-b-2 ${
              isActive ? "border-accent" : "border-transparent"
            }`}
          >
            <Text
              className={`text-[13px] ${
                isActive
                  ? "font-bold text-accent"
                  : "font-medium text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
