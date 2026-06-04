import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  titleClass?: string;
};

export default function SettingsRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onPress,
  right,
  titleClass,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      className="flex-row items-center gap-3 px-4 py-[14px] border-b border-border dark:border-dark-border last:border-b-0"
    >
      <View
        className="w-[34px] h-[34px] rounded-[9px] items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View className="flex-1">
        <Text
          className={`text-sm font-medium text-text dark:text-dark-text ${titleClass ?? ""}`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-[2px]">
            {subtitle}
          </Text>
        )}
      </View>

      {right ??
        (onPress && (
          <Ionicons name="chevron-forward" size={16} color="#6d6d6d" />
        ))}
    </TouchableOpacity>
  );
}
