import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// কাঁপার সাথে কোন ধরনের ভাইব্রেশন হবে
export type ShakeHaptic =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error"
  | "none";

export interface ShakeOptions {
  // সবচেয়ে বেশি কতটা pixel সরবে (ডিফল্ট ৮)
  distance?: number;
  // প্রতিটা নড়াচড়ার সময় ms এ (ডিফল্ট 50)
  duration?: number;
  // ভাইব্রেশনের ধরন (ডিফল্ট "light")
  haptic?: ShakeHaptic;
  // "x" হলে ডানে-বামে, "y" হলে উপর-নিচে (ডিফল্ট "x")
  axis?: "x" | "y";
}

const runHaptic = (type: ShakeHaptic) => {
  if (type === "none") return;

  // কিছু ডিভাইসে haptic সাপোর্ট না করলে যেন app crash না করে
  try {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        break;
      case "success":
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        break;
      case "warning":
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {},
        );
        break;
    }
  } catch {
    // কিছু করার দরকার নেই
  }
};

/**
 * যেকোনো জায়গায় কাঁপুনি (shake) + ভাইব্রেশন দেওয়ার hook।
 *
 * ব্যবহার:
 *   const { shake, shakeStyle } = useShake();
 *   <Animated.View style={shakeStyle}> ... </Animated.View>
 *   shake();                       // ডিফল্ট কাঁপুনি
 *   shake({ haptic: "error" });    // এই একবারের জন্য আলাদা সেটিং
 */
export default function useShake(defaultOptions: ShakeOptions = {}) {
  const {
    distance: defaultDistance = 8,
    duration: defaultDuration = 50,
    haptic: defaultHaptic = "light",
    axis = "x",
  } = defaultOptions;

  const offset = useSharedValue(0);

  const shake = useCallback(
    (overrides: ShakeOptions = {}) => {
      const distance = overrides.distance ?? defaultDistance;
      const duration = overrides.duration ?? defaultDuration;
      const haptic = overrides.haptic ?? defaultHaptic;

      runHaptic(haptic);

      // ধীরে ধীরে কমতে কমতে থেমে যাবে
      offset.value = withSequence(
        withTiming(-distance, { duration }),
        withTiming(distance, { duration }),
        withTiming(-distance * 0.75, { duration }),
        withTiming(distance * 0.75, { duration }),
        withTiming(-distance * 0.4, { duration }),
        withTiming(0, { duration }),
      );
    },
    [defaultDistance, defaultDuration, defaultHaptic, offset],
  );

  const shakeStyle = useAnimatedStyle(() =>
    axis === "x"
      ? { transform: [{ translateX: offset.value }] }
      : { transform: [{ translateY: offset.value }] },
  );

  return { shake, shakeStyle };
}
