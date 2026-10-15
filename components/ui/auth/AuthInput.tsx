import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import type { SvgProps } from "react-native-svg";

// চোখ খোলা আইকন (পাসওয়ার্ড দেখানোর বাটন)
import EyeIcon from "@/assets/icons/eye.svg";
// চোখ বন্ধ/কাটা আইকন (পাসওয়ার্ড লুকানোর বাটন)
import EyeOffIcon from "@/assets/icons/eye-crossed.svg";

interface Props extends TextInputProps {
  label: string;
  // আগে Ionicons-এর নাম (string) ছিল, এখন SVG কম্পোনেন্ট পাঠাতে হবে
  icon: React.FC<SvgProps>;
  error?: string | null;
  isPassword?: boolean;
  rightLabel?: React.ReactNode;
}

export default function AuthInput({
  label,
  icon: Icon,
  error,
  isPassword,
  rightLabel,
  ...inputProps
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const iconColor = error
    ? "#f87171"
    : focused
      ? "#22c55e"
      : isDark
        ? "#8a8a8a"
        : "#6d6d6d";

  const borderClass = error
    ? "border-red-500/60"
    : focused
      ? "border-accent"
      : "border-border dark:border-dark-border";

  const eyeColor = isDark ? "#8a8a8a" : "#6d6d6d";

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-text-secondary dark:text-dark-text-secondary text-xs font-semibold">
          {label}
        </Text>
        {rightLabel}
      </View>

      <View
        className={`flex-row items-center bg-background-secondary dark:bg-dark-background-secondary border rounded-2xl px-4 gap-3 h-[52px] ${borderClass}`}
      >
        {/* ইনপুটের বাম পাশের আইকন (mail / user / lock, বাইরে থেকে আসে) */}
        <Icon width={18} height={18} color={iconColor} />

        <TextInput
          {...inputProps}
          secureTextEntry={isPassword && !show}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={isDark ? "#4a4a4a" : "#9a9a9a"}
          className="flex-1 text-text dark:text-dark-text  font-medium h-full"
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShow((s) => !s)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {show ? (
              <EyeOffIcon width={18} height={18} color={eyeColor} />
            ) : (
              <EyeIcon width={18} height={18} color={eyeColor} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="text-red-400 text-xs mt-1.5 ml-1">{error}</Text>
      ) : null}
    </View>
  );
}
