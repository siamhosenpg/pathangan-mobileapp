import React from "react";
import { View } from "react-native";

export default function ProfileHeaderSkeleton() {
  return (
    <View className="bg-background dark:bg-dark-background px-4 pt-5 pb-3 flex-row items-center justify-between">
      {/* Left */}
      <View className="flex-row items-center gap-3 flex-1 mr-3">
        {/* Back Button */}
        <View className="w-8 h-8 rounded-full bg-background-secondary dark:bg-dark-background-secondary" />

        {/* Name */}
        <View className="h-6 w-36 rounded-md bg-background-secondary dark:bg-dark-background-secondary" />
      </View>

      {/* Follow Button */}
      <View className="h-9 w-24 rounded-full bg-background-secondary dark:bg-dark-background-secondary border border-border dark:border-dark-border" />
    </View>
  );
}
