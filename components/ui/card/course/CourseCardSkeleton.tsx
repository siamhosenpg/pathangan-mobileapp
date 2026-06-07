import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const CourseCardSkeleton = () => {
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
    <View className="bg-background dark:bg-dark-background px-4 py-3 rounded-xl">
      <View className="flex-row gap-3">
        {/* Left image */}
        <Animated.View
          style={{
            width: 105,
            height: 105,
            borderRadius: 12,
            backgroundColor: bg,
            opacity,
          }}
        />

        {/* Right content */}
        <View className="flex-1 justify-between">
          {/* Title */}
          <View className="gap-2">
            <Box height={14} />
            <Box width="75%" height={14} />
          </View>

          {/* Avatar + name */}
          <View className="flex-row items-center gap-2 mt-3">
            <Animated.View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: bg,
                opacity,
              }}
            />
            <Box width={90} height={12} />
          </View>

          {/* Price + stats */}
          <View className="flex-row items-center justify-between mt-3">
            <Box width={60} height={14} borderRadius={6} />
            <View className="flex-row items-center gap-3">
              <Box width={32} height={12} />
              <Box width={32} height={12} />
              <Box width={32} height={12} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CourseCardSkeleton;
