import { Ionicons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// (tabs)/_layout.tsx এ tabBarStyle.height = 70 + insets.bottom।
// tab bar এর উচ্চতা বদলালে এখানেও একই সংখ্যা বদলাতে হবে।
const TAB_BAR_BASE_HEIGHT = 70;
const GAP_ABOVE = 10; // tab bar এর সাথে banner এর ফাঁক
const ONLINE_VISIBLE_MS = 2500; // "আবার অনলাইনে" কতক্ষণ দেখাবে

/**
 * Internet না থাকলে tab bar এর ঠিক উপরে ভাসমান কার্ড দেখায়।
 * tab bar ঢাকে না, আর tap এর ভেতর দিয়ে চলে যায় (pointerEvents none)।
 * Root layout এ একবার বসালেই সব screen এ কাজ করবে।
 */
const NetworkBanner = () => {
  const { isConnected, isInternetReachable } = useNetInfo();
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOffline = useRef(false);

  // শুরুতে null থাকে, তাই শুধু স্পষ্টভাবে false হলে offline ধরি
  const isOffline = isConnected === false || isInternetReachable === false;

  // offline থেকে ফিরলে অল্প সময়ের জন্য "আবার অনলাইনে" দেখাই
  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      setShowBackOnline(false);
      return;
    }

    if (wasOffline.current) {
      wasOffline.current = false;
      setShowBackOnline(true);
      const timer = setTimeout(
        () => setShowBackOnline(false),
        ONLINE_VISIBLE_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!isOffline && !showBackOnline) return null;

  // tab bar আছে কি না: (tabs) group এর ভেতরে থাকলে tab bar সবসময় থাকে
  const isInTabs = (segments as string[])[0] === "(tabs)";
  const bottomOffset =
    (isInTabs ? TAB_BAR_BASE_HEIGHT + insets.bottom : insets.bottom) +
    GAP_ABOVE;

  const online = !isOffline;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        zIndex: 1000,
        paddingHorizontal: 16,
      }}
    >
      <Animated.View
        key={online ? "online" : "offline"}
        entering={FadeInDown.duration(260)}
        exiting={FadeOutDown.duration(200)}
        className="flex-row items-center gap-3 px-3.5 py-3 rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <View
          className={`w-9 h-9 rounded-full items-center justify-center ${
            online ? "bg-accent/15" : "bg-red-500/15"
          }`}
        >
          <Ionicons
            name={online ? "wifi" : "cloud-offline-outline"}
            size={18}
            color={online ? "#00914d" : "#EF4444"}
          />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold text-text dark:text-dark-text">
            {online ? "আবার অনলাইনে" : "ইন্টারনেট সংযোগ নেই"}
          </Text>
          <Text className="text-xs mt-0.5 text-text-secondary dark:text-dark-text-secondary">
            {online ? "সংযোগ ফিরে এসেছে" : "সংযোগ ফিরলে নিজে থেকেই লোড হবে"}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default NetworkBanner;
