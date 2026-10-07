import {
  useDeleteRatingMutation,
  useGetMyRatingQuery,
  useGetRatingsByAnswerQuery,
  useGiveRatingMutation,
} from "@/redux/api/rating/rattingApi";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface Props {
  answerId: string;
}

const STARS = [1, 2, 3, 4, 5];
const ACTIVE_COLOR = "#00914d";

// ===================== SINGLE STAR (pop animation সহ) =====================
interface StarProps {
  filled: boolean;
  emptyColor: string;
  disabled: boolean;
  label: string;
  onPress: () => void;
}

const Star = ({ filled, emptyColor, disabled, label, onPress }: StarProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  // তারা ফাঁকা থেকে ভরা হলে ছোট্ট pop animation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!filled) return;
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
    ]).start();
  }, [filled, scale]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
      className="p-1"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <FontAwesome
          name={filled ? "star" : "star-o"}
          size={26}
          color={filled ? ACTIVE_COLOR : emptyColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// ===================== MAIN COMPONENT =====================
export function AnswerRating({ answerId }: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: ratingStats } = useGetRatingsByAnswerQuery(answerId);
  const { data: myRating } = useGetMyRatingQuery(answerId);
  const [giveRating, { isLoading: isGiving }] = useGiveRatingMutation();
  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation();

  const [error, setError] = useState("");

  const isBusy = isGiving || isDeleting;
  const currentRating = myRating?.userRating ?? 0;
  const averageRating = ratingStats?.averageRating ?? 0;
  const ratingCount = ratingStats?.ratingCount ?? 0;
  const hasRated = currentRating > 0;

  const emptyStarColor = isDark ? "#3f3f46" : "#d4d4d8";

  const handleRating = async (star: number) => {
    // একই rating আবার দিলে বা আগের request চলাকালীন কিছু করা হবে না
    if (isBusy || star === currentRating) return;
    setError("");
    try {
      await giveRating({ answerId, rating: star }).unwrap();
    } catch {
      // cache আগেই rollback হয়ে গেছে, শুধু message দেখানো
      setError(t("ratingData.ratingFailed"));
    }
  };

  const handleRemove = async () => {
    if (isBusy || !hasRated) return;
    setError("");
    try {
      await deleteRating(answerId).unwrap();
    } catch {
      setError(t("ratingData.removeFailed"));
    }
  };

  return (
    <View className="mt-4 pt-4 border-t border-border dark:border-dark-border">
      {/* Title */}
      <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-1.5">
        {hasRated ? t("ratingData.yourRating") : t("ratingData.rateThis")}
      </Text>

      {/* Stars + average */}
      <View className="flex-row items-center">
        <View
          className="flex-row items-center -ml-1"
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          {STARS.map((star) => (
            <Star
              key={star}
              filled={currentRating >= star}
              emptyColor={emptyStarColor}
              disabled={isBusy}
              label={t("ratingData.rateStars", { value: star })}
              onPress={() => handleRating(star)}
            />
          ))}
        </View>

        {ratingCount > 0 && (
          <View className="flex-row items-center gap-1 ml-2">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {averageRating.toFixed(1)}
            </Text>
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              {t("ratingData.ratingCount", { value: ratingCount })}
            </Text>
          </View>
        )}
      </View>

      {/* আমার rating এর feedback + remove button */}
      {hasRated && (
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="text-xs font-medium text-accent">
            {t("ratingData.starsGiven", { value: currentRating })}
            {" · "}
            {t(`ratingData.label${currentRating}`)}
          </Text>

          <TouchableOpacity
            onPress={handleRemove}
            disabled={isBusy}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-xs font-medium text-text-tertiary dark:text-dark-text-tertiary">
              {t("ratingData.removeRating")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error */}
      {error ? (
        <Text className="text-xs text-red-500 mt-1.5">{error}</Text>
      ) : null}
    </View>
  );
}
