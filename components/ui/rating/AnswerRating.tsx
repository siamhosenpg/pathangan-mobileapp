import {
  useGetMyRatingQuery,
  useGetRatingsByAnswerQuery,
  useGiveRatingMutation,
} from "@/redux/api/rating/rattingApi";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface Props {
  answerId: string;
}

export function AnswerRating({ answerId }: Props) {
  const { data: ratingStats } = useGetRatingsByAnswerQuery(answerId);
  const { data: myRating } = useGetMyRatingQuery(answerId);
  const [giveRating, { isLoading }] = useGiveRatingMutation();

  const [hovered, setHovered] = useState<number>(0);

  const currentRating = myRating?.userRating ?? 0;
  const averageRating = ratingStats?.averageRating ?? 0;
  const ratingCount = ratingStats?.ratingCount ?? 0;
  const hasRated = currentRating > 0;

  const activeRating = hovered > 0 ? hovered : currentRating;

  const handleRating = async (star: number) => {
    if (isLoading) return;
    await giveRating({ answerId, rating: star });
  };

  function toBanglaNumber(value: number): string {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(value).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
  }

  return (
    <View className="mt-4 pt-4 border-t border-border">
      {/* Label */}
      <Text className="text-xs text-text-tertiary mb-2">
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
                activeOpacity={0.7}
                className="p-0.5"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#00914d" />
                ) : isFilled ? (
                  <FontAwesome name="star" size={20} color="#00914d" />
                ) : (
                  <FontAwesome name="star-o" size={20} color="#e7e7e7" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stats */}
        {ratingCount > 0 && (
          <View className="flex-row items-center gap-1 ml-1">
            <Text className="text-sm font-semibold text-text-primary">
              {averageRating.toFixed(1)}
            </Text>
            <Text className="text-xs text-text-tertiary">
              ({toBanglaNumber(ratingCount)} জন)
            </Text>
          </View>
        )}
      </View>

      {/* Feedback */}
      {hasRated && (
        <Text className="text-xs text-text-tertiary mt-1.5">
          আপনি{" "}
          <Text className="text-accent font-medium">
            {toBanglaNumber(currentRating)} তারা
          </Text>{" "}
          দিয়েছেন
        </Text>
      )}
    </View>
  );
}
