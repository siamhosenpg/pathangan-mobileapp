import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const ProfileTopSectionSkeleton = () => {
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
    borderRadius = 8,
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
    <View className="bg-background dark:bg-dark-background">
      {/* Cover */}
      <View className="w-full p-4">
        <Animated.View
          style={{
            opacity,
            backgroundColor: bg,
            borderRadius: 8,
            aspectRatio: 6 / 2,
            width: "100%",
          }}
        />
      </View>

      <View className="px-4 pb-4">
        {/* Avatar + Name */}
        <View className="flex-row items-center gap-2">
          <Animated.View
            style={{
              opacity,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: bg,
            }}
          />
          <View className="flex-1 gap-2">
            <Box width={160} height={18} borderRadius={6} />
            <Box width={110} height={14} borderRadius={6} />
          </View>
        </View>

        {/* Buttons */}
        <View className="mt-4 flex-row gap-2">
          <Box width={112} height={38} borderRadius={999} />
          <Box width={128} height={38} borderRadius={999} />
        </View>

        {/* Stats */}
        <View className="mt-5 flex-row justify-between px-2">
          {[1, 2, 3].map((item) => (
            <View key={item} className="items-center gap-2">
              <Box width={40} height={18} borderRadius={6} />
              <Box width={64} height={13} borderRadius={6} />
            </View>
          ))}
        </View>

        {/* Bio */}
        <View className="mt-4">
          <Box width={160} height={16} borderRadius={6} />
        </View>

        {/* About */}
        <View className="mt-3 gap-2">
          <Box height={14} borderRadius={6} />
          <Box width="90%" height={14} borderRadius={6} />
          <Box width="75%" height={14} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

export default ProfileTopSectionSkeleton;
