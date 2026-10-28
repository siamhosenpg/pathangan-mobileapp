import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { SvgProps } from "react-native-svg";

// চোখ খোলা আইকন (পাসওয়ার্ড দেখানোর বাটন)
import EyeIcon from "@/assets/icons/eye.svg";
// চোখ বন্ধ/কাটা আইকন (পাসওয়ার্ড লুকানোর বাটন)
import EyeOffIcon from "@/assets/icons/eye-crossed.svg";

const ACCENT = "#22c55e"; // tailwind এর accent রঙের সাথে মিলিয়ে নিও
const ERROR = "#f87171";
const BORDER_WIDTH = 1.5;
const RADIUS = 16; // rounded-2xl
const HEIGHT = 54;

interface Props extends TextInputProps {
  // এখন স্ক্রিনে দেখানো হয় না, শুধু accessibility-র জন্য
  label: string;
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
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const hasError = !!error;
  const muted = isDark ? "#8a8a8a" : "#6d6d6d";

  // 0 → 1 : ফোকাস / error progress
  const focus = useSharedValue(0);
  const errorP = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    errorP.value = withTiming(hasError ? 1 : 0, { duration: 200 });
    if (hasError) {
      shake.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 80 }),
        withTiming(-4, { duration: 80 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [hasError, error]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  // accent / error রঙের ring, ফোকাসে ফেড-ইন হয়
  const ringStyle = useAnimatedStyle(() => ({
    opacity: Math.max(focus.value, errorP.value),
    borderColor: hasError ? ERROR : ACCENT,
  }));

  // ফোকাসে হালকা glow (শুধু ফোকাসে, error এ না)
  const glowStyle = useAnimatedStyle(() => ({
    opacity: hasError ? 0 : focus.value * 0.18,
  }));

  // ফোকাসে আইকন সামান্য বড় হয়
  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + focus.value * 0.12 }],
  }));

  const iconColor = hasError ? ERROR : focused ? ACCENT : muted;

  return (
    <View className="mb-4">
      <Animated.View style={boxStyle}>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          accessibilityLabel={label}
          className="flex-row items-center px-4 gap-3 bg-background-secondary dark:bg-dark-background-secondary border-border dark:border-dark-border"
          style={{
            height: HEIGHT,
            borderWidth: BORDER_WIDTH,
            borderRadius: RADIUS,
          }}
        >
          {/* ফোকাস glow */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: RADIUS - BORDER_WIDTH, backgroundColor: ACCENT },
              glowStyle,
            ]}
          />

          <Animated.View style={iconWrapStyle}>
            <Icon width={18} height={18} color={iconColor} />
          </Animated.View>

          <TextInput
            {...inputProps}
            ref={inputRef}
            accessibilityLabel={label}
            secureTextEntry={isPassword && !show}
            selectionColor={ACCENT}
            cursorColor={ACCENT}
            onFocus={(e) => {
              setFocused(true);
              focus.value = withTiming(1, {
                duration: 200,
                easing: Easing.out(Easing.cubic),
              });
              inputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              focus.value = withTiming(0, { duration: 200 });
              inputProps.onBlur?.(e);
            }}
            placeholderTextColor={isDark ? "#5a5a5a" : "#9a9a9a"}
            className="flex-1 text-text dark:text-dark-text font-medium h-full"
          />

          {rightLabel ? <View>{rightLabel}</View> : null}

          {isPassword && (
            <TouchableOpacity
              onPress={() => setShow((s) => !s)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {show ? (
                <EyeOffIcon width={18} height={18} color={muted} />
              ) : (
                <EyeIcon width={18} height={18} color={muted} />
              )}
            </TouchableOpacity>
          )}
        </Pressable>

        {/* accent / error ring */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderWidth: BORDER_WIDTH,
              borderRadius: RADIUS,
            },
            ringStyle,
          ]}
        />
      </Animated.View>

      {error ? (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOut.duration(120)}
        >
          <Text className="text-red-400 text-xs mt-1.5 ml-1">{error}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
