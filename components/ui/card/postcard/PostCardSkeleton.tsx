import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const PostCardSkeleton = () => {
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
    <View className="bg-background dark:bg-dark-background w-full pt-6 pb-6">
      {/* Top profile section */}
      <View className="px-6 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <Animated.View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: bg,
              opacity,
            }}
          />
          {/* Name + time */}
          <View className="gap-2">
            <Box width={144} height={14} />
            <Box width={80} height={12} />
          </View>
        </View>
        {/* Three dot */}
        <Animated.View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: bg,
            opacity,
          }}
        />
      </View>

      {/* Title */}
      <View className="px-6 mt-2">
        <Box width="66%" height={18} />
      </View>

      {/* Text lines */}
      <View className="px-6 mt-4 gap-2">
        <Box height={14} />
        <Box height={14} />
        <Box width="75%" height={14} />
      </View>

      {/* Image */}
      <View className="mt-5 px-6">
        <Box height={192} borderRadius={12} />
      </View>
    </View>
  );
};

export default PostCardSkeleton;
