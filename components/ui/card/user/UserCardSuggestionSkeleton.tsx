import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function UserCardSuggestionSkeleton() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const bg = isDark ? "#2a2a2a" : "#dddddd";

  return (
    <Animated.View
      style={{ opacity }}
      className="flex-row items-center gap-3 px-4 py-4 rounded-xl bg-background dark:bg-dark-background"
    >
      {/* Avatar skeleton */}
      <View
        style={{ backgroundColor: bg }}
        className="w-12 h-12 rounded-full"
      />

      {/* Info skeleton */}
      <View className="flex-1 gap-2">
        <View
          style={{
            backgroundColor: bg,
            width: "50%",
            height: 14,
            borderRadius: 6,
          }}
        />
        <View
          style={{
            backgroundColor: bg,
            width: "75%",
            height: 12,
            borderRadius: 6,
          }}
        />
      </View>

      {/* Follow button skeleton */}
      <View
        style={{ backgroundColor: bg, width: 72, height: 30, borderRadius: 20 }}
      />
    </Animated.View>
  );
}
