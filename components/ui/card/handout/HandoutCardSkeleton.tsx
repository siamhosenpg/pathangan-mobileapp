import React from "react";
import { View } from "react-native";

const HandoutCardSkeleton = () => {
  return (
    <View className="rounded-2xl overflow-hidden bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border">
      <View className="w-full h-40 bg-background-tertiary dark:bg-dark-background-tertiary" />
      <View className="p-4 gap-3">
        <View className="h-4 w-3/4 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
        <View className="h-3 w-full rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
        <View className="h-3 w-2/3 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
        <View className="flex-row items-center gap-2 mt-1">
          <View className="w-6 h-6 rounded-full bg-background-tertiary dark:bg-dark-background-tertiary" />
          <View className="h-3 w-24 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
        </View>
      </View>
    </View>
  );
};

export default HandoutCardSkeleton;
