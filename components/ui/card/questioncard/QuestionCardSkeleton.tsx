import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const QuestionCardSkeleton = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const bg = isDark ? "#2a2a2a" : "#dddddd";

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

  const Box = ({
    width,
    height,
    borderRadius = 6,
    style,
  }: {
    width?: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
  }) => (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius,
          backgroundColor: bg,
          opacity,
        },
        style,
      ]}
    />
  );

  return (
    <View className="bg-background dark:bg-dark-background pt-4">
      {/* PostProfileTop skeleton */}
      <View className="px-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Animated.View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: bg,
              opacity,
            }}
          />
          <View className="gap-2">
            <Box width={120} height={13} />
            <Box width={72} height={11} />
          </View>
        </View>
        {/* three dot */}
        <Animated.View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: bg,
            opacity,
          }}
        />
      </View>

      {/* Question text */}
      <View className="px-4 mt-3 gap-2">
        <Box height={16} />
        <Box width="80%" height={16} />
      </View>

      {/* Answer cards */}
      <View className="px-4 mt-3 gap-2">
        <Box height={72} borderRadius={12} />
        <Box height={72} borderRadius={12} />
      </View>

      {/* Count row */}
      <View className="px-4 py-3 mt-2 border-b border-border dark:border-dark-border flex-row items-center justify-between">
        <Box width={120} height={13} />
        <Box width={80} height={13} />
      </View>

      {/* Action row */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-6">
          <Box width={48} height={13} borderRadius={6} />
          <Box width={48} height={13} borderRadius={6} />
          <Box width={48} height={13} borderRadius={6} />
        </View>
        <Box width={28} height={28} borderRadius={6} />
      </View>
    </View>
  );
};

export default QuestionCardSkeleton;
