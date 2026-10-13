import {
  useDeleteChapterRatingMutation,
  useGetChapterRatingQuery,
  useGiveChapterRatingMutation,
} from "@/redux/api/rating/chapterRatingApi";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface Props {
  chapterId: string;
  // দিলে handout এর average ও সাথে সাথে বদলাবে
  handoutId?: string;
}

const STARS = [1, 2, 3, 4, 5];
const ACTIVE_COLOR = "#00914d";

// ===================== হালকা fade + নিচ থেকে উঠে আসা =====================
const FadeInView = ({ children }: { children: ReactNode }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

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
export function ChapterRating({ chapterId, handoutId }: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data } = useGetChapterRatingQuery(chapterId);
  const [giveRating, { isLoading: isGiving }] = useGiveChapterRatingMutation();
  const [deleteRating, { isLoading: isDeleting }] =
    useDeleteChapterRatingMutation();

  const [error, setError] = useState("");

  // অন্য chapter এ গেলে পুরনো error মুছে যাবে
  useEffect(() => {
    setError("");
  }, [chapterId]);

  // data আসার আগে কিছু দেখাবো না (owner এর কাছে stars ঝলকাবে না)
  if (!data) return null;

  const isBusy = isGiving || isDeleting;
  const currentRating = data.userRating ?? 0;
  const averageRating = data.averageRating ?? 0;
  const ratingCount = data.ratingCount ?? 0;
  const hasRated = currentRating > 0;
  const isOwner = data.isOwner;

  const emptyStarColor = isDark ? "#3f3f46" : "#d4d4d8";

  // ✅ নিজের chapter: rating দেওয়ার option নেই, শুধু average দেখা যাবে
  if (isOwner) {
    if (ratingCount === 0) return null;

    return (
      <FadeInView>
        <View className="mt-8 pt-4 border-t border-border dark:border-dark-border">
          <View className="flex-row items-center gap-2">
            <FontAwesome name="star" size={16} color={ACTIVE_COLOR} />
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {averageRating.toFixed(1)}
            </Text>
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              {t("ratingData.ratingCount", { value: ratingCount })}
            </Text>
          </View>
        </View>
      </FadeInView>
    );
  }

  const handleRating = async (star: number) => {
    // একই rating আবার দিলে বা আগের request চলাকালীন কিছু করা হবে না
    if (isBusy || star === currentRating) return;
    setError("");
    try {
      await giveRating({ chapterId, rating: star, handoutId }).unwrap();
    } catch {
      // cache আগেই rollback হয়ে গেছে, শুধু message দেখানো
      setError(t("ratingData.ratingFailed"));
    }
  };

  const handleRemove = async () => {
    if (isBusy || !hasRated) return;
    setError("");
    try {
      await deleteRating({ chapterId, handoutId }).unwrap();
    } catch {
      setError(t("ratingData.removeFailed"));
    }
  };

  return (
    <FadeInView>
      <View className="mt-8 pt-4 border-t border-border dark:border-dark-border">
        <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-1.5">
          {hasRated ? t("ratingData.yourRating") : t("ratingData.rateThis")}
        </Text>

        <View className="flex-row items-center">
          <View className="flex-row items-center -ml-1">
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

          {/* প্রথম rating পড়লে average নরম ভাবে ফুটে উঠবে */}
          {ratingCount > 0 && (
            <FadeInView>
              <View className="flex-row items-center gap-1 ml-2">
                <Text className="text-sm font-semibold text-text dark:text-dark-text">
                  {averageRating.toFixed(1)}
                </Text>
                <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
                  {t("ratingData.ratingCount", { value: ratingCount })}
                </Text>
              </View>
            </FadeInView>
          )}
        </View>

        {hasRated && (
          <View className="flex-row items-center justify-between mt-1.5">
            {/* key দেওয়ায় প্রতিবার rating বদলালে লেখাটা নতুন করে fade হবে */}
            <FadeInView key={currentRating}>
              <Text className="text-xs font-medium text-accent">
                {t("ratingData.starsGiven", { value: currentRating })}
                {" · "}
                {t(`ratingData.label${currentRating}`)}
              </Text>
            </FadeInView>

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

        {error ? (
          <Text className="text-xs text-red-500 mt-1.5">{error}</Text>
        ) : null}
      </View>
    </FadeInView>
  );
}
