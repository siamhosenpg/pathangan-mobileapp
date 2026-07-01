import { useFollowUserMutation } from "@/redux/api/followApi";
import { useAppSelector } from "@/redux/hooks";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
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

  // ❌ useGetFollowersQuery বাদ — N+1 এর কারণ ছিল
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value * (isLoading ? 0.6 : 1),
  }));
  // ----------------------------------------

  const onPressIn = () => {
    scale.value = withSpring(0.92, { damping: 12, stiffness: 250 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  const handleFollow = async () => {
    if (!currentUser || isLoading || localFollowing) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Optimistic update
    setLocalFollowing(true);

    // 🎬 quick pop, then shrink + fade out
    scale.value = withSpring(1.15, { damping: 6, stiffness: 280 }, () => {
      scale.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setIsHidden)(true);
        }
      });
    });

    opacity.value = withTiming(0, { duration: 250 });

    try {
      await followUser(targetUserId).unwrap();
    } catch (err) {
      // rollback
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
