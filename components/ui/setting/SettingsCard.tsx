import React from "react";
import { View } from "react-native";

type Props = { children: React.ReactNode };

export default function SettingsCard({ children }: Props) {
  return (
    <View className="bg-background-secondary dark:bg-dark-background-secondary rounded-2xl border border-border dark:border-dark-border overflow-hidden mb-5">
      {children}
    </View>
  );
}
