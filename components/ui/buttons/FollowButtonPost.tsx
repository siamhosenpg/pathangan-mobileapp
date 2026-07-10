import { useFollowUserMutation } from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  targetUserId: string;
  initialIsFollowing?: boolean; // ✅ server থেকে আসা সত্যি ডেটা
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FollowButtonPost = ({
  targetUserId,
  initialIsFollowing = false,
}: Props) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id ?? (currentUser as any)?._id;

  const [localFollowing, setLocalFollowing] = useState(initialIsFollowing);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setLocalFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const [followUser, { isLoading: following }] = useFollowUserMutation();

  const isLoading = following;

  // ---------- Animation values ----------
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pressed = useSharedValue(false); // ✅ guard: press হয়ে গেলে onPressOut আর scale টাচ করবে না
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value * (isLoading ? 0.6 : 1),
  }));
  // ----------------------------------------

  const onPressIn = () => {
    if (pressed.value) return; // ✅ ইতিমধ্যে follow flow চললে ignore
    scale.value = withSpring(0.92, { damping: 12, stiffness: 250 });
  };

  const onPressOut = () => {
    if (pressed.value) return; // ✅ পপ/শ্রিংক animation কে interrupt করতে দেবে না
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  useEffect(() => {
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const handleFollow = async () => {
    if (!currentUser || isLoading || localFollowing) return;

    pressed.value = true; // ✅ এখন থেকে onPressIn/onPressOut আর scale ছোঁবে না

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Optimistic update
    setLocalFollowing(true);

    // 🎬 quick pop, then shrink + fade out — একই chain এ, interrupt-proof
    scale.value = withSequence(
      withSpring(1.15, { damping: 6, stiffness: 280 }),
      withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setIsHidden)(true);
        }
      }),
    );

    opacity.value = withTiming(0, { duration: 250 });

    // ✅ Safety net: animation callback কোনো কারণে না চললেও ৬০০ms পর force hide
    fallbackTimer.current = setTimeout(() => {
      setIsHidden(true);
    }, 600);

    try {
      await followUser(targetUserId).unwrap();
    } catch (err) {
      // rollback
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      pressed.value = false;
      setLocalFollowing(false);
      setIsHidden(false);
      scale.value = withSpring(1, { damping: 12, stiffness: 250 });
      opacity.value = withTiming(1, { duration: 200 });
      console.error("Follow failed:", err);
    }
  };

  // ✅ নিজের পোস্টে কোনো বাটন থাকবে না
  if (!currentUserId || currentUserId === targetUserId) return null;

  // ✅ আগে থেকে follow করা থাকলে সম্পূর্ণ blank — কিছুই দেখাবে না
  if (initialIsFollowing) return null;

  // ✅ ক্লিক করার পর exit-animation শেষ হয়ে গেলে blank
  if (localFollowing && isHidden) return null;

  return (
    <AnimatedTouchable
      onPress={handleFollow}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isLoading || localFollowing}
      activeOpacity={0.8}
      style={animatedStyle}
      className="px-2 py-0.5 flex-row gap-1 items-center justify-center rounded-full bg-accent"
    >
      <Text className="font-semibold text-xs" style={{ color: "#fff" }}>
        {isLoading ? "..." : t("follow")}
      </Text>
    </AnimatedTouchable>
  );
};

export default FollowButtonPost;
