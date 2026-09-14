import React from "react";
import { View } from "react-native";

const HandoutCardSkeleton = () => {
  return (
    <View className="flex-row gap-3 px-4 rounded-2xl">
      {/* কভার ইমেজ (বামে) */}
      <View className="w-24 aspect-[2/3] rounded-xl overflow-hidden bg-background-tertiary dark:bg-dark-background-tertiary" />

      {/* কনটেন্ট (ডানে) */}
      <View className="flex-1 justify-between py-0.5">
        <View className="gap-1.5">
          {/* টাইটেল */}
          <View className="h-4 w-11/12 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
          <View className="h-4 w-2/3 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />

          {/* ডেসক্রিপশন */}
          <View className="h-3 w-full rounded-md bg-background-tertiary dark:bg-dark-background-tertiary mt-1" />
          <View className="h-3 w-4/5 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />

          {/* লেখক তথ্য */}
          <View className="flex-row items-center gap-2 mt-1">
            <View className="w-5 h-5 rounded-full bg-background-tertiary dark:bg-dark-background-tertiary" />
            <View className="h-3 w-24 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
          </View>
        </View>

        {/* স্ট্যাটস রো */}
        <View className="flex-row items-center gap-3 mt-2 pt-2 border-t border-border/50 dark:border-dark-border/50">
          <View className="h-3 w-12 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
          <View className="h-3 w-10 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
          <View className="h-3 w-8 rounded-md bg-background-tertiary dark:bg-dark-background-tertiary" />
        </View>
      </View>
    </View>
  );
};

export default HandoutCardSkeleton;
