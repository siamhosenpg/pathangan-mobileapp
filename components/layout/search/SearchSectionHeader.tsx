import React from "react";
import { Text, View } from "react-native";

interface Props {
  title: string;
  count: number;
}

export default function SearchSectionHeader({ title, count }: Props) {
  return (
    <View className="flex-row items-center gap-1.5 px-4 pt-4 pb-2 bg-background-secondary dark:bg-dark-background-secondary">
      <Text className="text-xs font-bold text-text-secondary dark:text-dark-text-secondary tracking-wide">
        {title}
      </Text>
      <View className="bg-background-tertiary dark:bg-dark-background-tertiary rounded-full px-1.5 py-0.5">
        <Text className="text-[10px] font-semibold text-text-tertiary dark:text-dark-text-tertiary">
          {count}
        </Text>
      </View>
    </View>
  );
}
