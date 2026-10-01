import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

// আপনার green রঙ
const COLORS = ["#00914d", "#009439", "#00914d"];

// প্রতিটা ফোঁটার শুরুর delay (ms) — এতে ঢেউয়ের মতো দেখায়
const DELAYS = [0, 160, 320];

const Dot = ({ color, delay }: { color: string; delay: number }) => {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // তিনটা ফোঁটার চক্র সমান রাখতে বাকি সময়টুকু অপেক্ষা
        Animated.delay(480 - delay),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [value, delay]);

  const scale = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.1],
  });
  const opacity = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <View
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
    </Animated.View>
  );
};

// ✅ এখন আর absolute নয়। নিজের ৬৪px জায়গার ঠিক মাঝখানে বসে,
// তাই list-এর header-এ রাখলে list-এর সাথেই scroll করবে।
export default function PullRefreshLoader() {
  return (
    <View pointerEvents="none" className="h-16 items-center justify-center">
      <View className="flex-row items-center gap-2">
        {COLORS.map((color, i) => (
          <Dot key={i} color={color} delay={DELAYS[i]} />
        ))}
      </View>
    </View>
  );
}
