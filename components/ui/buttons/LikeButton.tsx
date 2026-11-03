import Heart from "@/assets/icons/heart.svg";
import HeartBold from "@/assets/icons/heartBold.svg";
import { useIconColor } from "@/hooks/useIconColor";
import { patchForYouPost } from "@/redux/api/feedApi";
import { useToggleReactionMutation } from "@/redux/api/reactionApi";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";

const LikeButton = ({
  postId,
  initialLiked,
}: {
  postId: string;
  initialLiked: boolean;
}) => {
  const dispatch = useDispatch<any>();
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

    // "আপনার জন্য" ফিডের cache-ও সঙ্গে সঙ্গে বদলানো (reactionApi শুধু বাকি cache বদলায়)
    // post ফিডে না থাকলে এটা কিছুই করে না
    const feedPatch = dispatch(
      patchForYouPost(postId, (post) => {
        const nextLiked = !post.isReacted;
        post.isReacted = nextLiked;
        post.likesCount = Math.max(
          0,
          (post.likesCount ?? 0) + (nextLiked ? 1 : -1),
        );
      }),
    );

    try {
      await toggleReaction(postId).unwrap();
      // ✅ বাকি cache-এর optimistic update আগের মতো reactionApi করবে
    } catch {
      feedPatch.undo();
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
