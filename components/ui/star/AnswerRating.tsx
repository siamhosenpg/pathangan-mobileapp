// components/ui/star/AnswerRating.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import {
  useGetMyRatingQuery,
  useGetRatingsByAnswerQuery,
  useGiveRatingMutation,
} from "@/redux/api/rating/rattingApi";

interface Props {
  answerId: string;
}

export function AnswerRating({ answerId }: Props) {
  const { data: ratingStats } = useGetRatingsByAnswerQuery(answerId);
  const { data: myRating } = useGetMyRatingQuery(answerId);
  const [giveRating, { isLoading }] = useGiveRatingMutation();

  // hover এর বদলে press state — mobile এ hover নেই
  const [pressed, setPressed] = useState<number>(0);

  const currentRating = myRating?.userRating ?? 0;
  const averageRating = ratingStats?.averageRating ?? 0;
  const ratingCount = ratingStats?.ratingCount ?? 0;
  const hasRated = currentRating > 0;

  const handleRating = async (star: number) => {
    if (isLoading) return;
    await giveRating({ answerId, rating: star });
    setPressed(0);
  };

  // press করলে press value, না হলে আমার দেওয়া rating
  const activeRating = pressed > 0 ? pressed : currentRating;

  return (
    <View className="mt-4 pt-4 border-t border-border dark:border-dark-border ">
      {/* লেবেল */}
      <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-2">
        {hasRated ? "আপনার রেটিং" : "এই উত্তরটি রেট করুন"}
      </Text>

      <View className="flex-row items-center gap-2">
        {/* Stars */}
        <View className="flex-row items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = activeRating >= star;

            return (
              <TouchableOpacity
                key={star}
                disabled={isLoading}
                onPress={() => handleRating(star)}
                onPressIn={() => setPressed(star)}
                onPressOut={() => setPressed(0)}
                activeOpacity={0.7}
                className="p-1 disabled:opacity-50"
              >
                <Ionicons
                  name={isFilled ? "star" : "star-outline"}
                  size={20}
                  color={isFilled ? "#00914d" : "#e7e7e7"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* গড় রেটিং ও মোট সংখ্যা */}
        {ratingCount > 0 && (
          <View className="flex-row items-center gap-1 ml-1">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {averageRating.toFixed(1)}
            </Text>
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              ({ratingCount} জন)
            </Text>
          </View>
        )}
      </View>

      {/* রেটিং দেওয়া থাকলে feedback দেখাও */}
      {hasRated && (
        <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-1.5">
          আপনি{" "}
          <Text className="text-accent font-medium">{currentRating} তারা</Text>{" "}
          দিয়েছেন
        </Text>
      )}
    </View>
  );
}
