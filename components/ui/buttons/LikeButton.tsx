import Heart from "@/assets/icons/heart.svg";
import HeartBold from "@/assets/icons/heartBold.svg";
import { useIconColor } from "@/hooks/useIconColor";
import { useToggleReactionMutation } from "@/redux/api/reactionApi";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity } from "react-native";

const LikeButton = ({
  postId,
  initialLiked,
}: {
  postId: string;
  initialLiked: boolean;
}) => {
  const [toggleReaction, { isLoading }] = useToggleReactionMutation();
  const { primary, accent } = useIconColor();

  // ✅ local state নেই — সরাসরি prop থেকে পড়ছি
  // RTK Query cache update হলে parent re-render হবে, নতুন prop আসবে
  const isLiked = initialLiked;
  const iconColor = isLiked ? accent : primary;
  const { t } = useTranslation();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLike = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 50,
        bounciness: 20,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
    ]).start();

    try {
      await toggleReaction(postId).unwrap();
      // ✅ setIsLiked নেই — RTK Query optimistic update cache ঠিক করবে
      // cache update → parent re-render → নতুন initialLiked prop আসবে
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLike}
      disabled={isLoading}
      className="flex-row items-center gap-1.5 py-3.5"
      style={{ opacity: isLoading ? 1 : 1 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {isLiked ? (
          <HeartBold width={18} height={18} color={iconColor} />
        ) : (
          <Heart width={18} height={18} color={iconColor} />
        )}
      </Animated.View>
      <Text
        className={
          isLiked
            ? "font-semibold text-base text-accent-secondary dark:text-dark-accent-secondary"
            : "font-semibold text-base text-text dark:text-dark-text"
        }
      >
        {t("love")}
      </Text>
    </TouchableOpacity>
  );
};

export default LikeButton;
