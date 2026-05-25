import { useToggleReactionMutation } from "@/redux/api/reactionApi";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";

const LikeButton = ({
  postId,
  initialLiked,
}: {
  postId: string;
  initialLiked: boolean;
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [toggleReaction, { isLoading }] = useToggleReactionMutation();

  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLike = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.4,
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
      const res = await toggleReaction(postId).unwrap();
      setIsLiked(res.liked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLike}
      disabled={isLoading}
      className="flex-row items-center gap-1.5 py-3"
      style={{ opacity: isLoading ? 0.6 : 1 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={20}
          color={isLiked ? "#00914d" : undefined}
          className={
            isLiked ? "" : "text-text-secondary dark:text-dark-text-secondary"
          }
        />
      </Animated.View>
      <Text
        className={
          isLiked
            ? "font-semibold text-base text-accent"
            : "font-semibold text-base text-text-secondary dark:text-dark-text-secondary"
        }
      >
        সমর্থন
      </Text>
    </TouchableOpacity>
  );
};

export default LikeButton;
