import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const Pulse = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

const bone = "bg-background-tertiary dark:bg-dark-background-tertiary";

const HandoutCardSkeleton = () => {
  return (
    <Pulse>
      {/* card-er moto same container: padding/border nai */}
      <View className="flex-row gap-3.5 mx-4">
        {/* কভার ইমেজ (বামে) */}
        <View className={`w-24 aspect-[2/3] rounded-2xl ${bone}`} />

        {/* কনটেন্ট (ডানে) */}
        <View className="flex-1 justify-center gap-1.5 py-0.5">
          <View className="gap-1.5">
            {/* title (1 line, leading-6 er jaiga rakha hoyeche) */}
            <View className="h-6 justify-center">
              <View className={`h-4 w-3/4 rounded-md ${bone}`} />
            </View>

            {/* description (2 lines, leading-5) */}
            <View>
              <View className="h-5 justify-center">
                <View className={`h-3 w-full rounded-md ${bone}`} />
              </View>
              <View className="h-5 justify-center">
                <View className={`h-3 w-4/5 rounded-md ${bone}`} />
              </View>
            </View>

            {/* category */}
            <View className={`h-2.5 w-16 rounded-md ${bone}`} />

            {/* লেখক তথ্য */}
            <View className="flex-row items-center gap-2 mt-1">
              <View className={`w-5 h-5 rounded-full ${bone}`} />
              <View className={`h-3 w-24 rounded-md ${bone}`} />
            </View>
          </View>
        </View>
      </View>
    </Pulse>
  );
};

export default HandoutCardSkeleton;
