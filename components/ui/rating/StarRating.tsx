import { FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";

interface StarRatingProps {
  rating: number;
  size?: number;
  maxStars?: number;
}

const StarRating = ({ rating, size = 14, maxStars = 5 }: StarRatingProps) => {
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;

        if (rating >= starIndex) {
          return (
            <FontAwesome key={i} name="star" size={size} color="#00914d" />
          );
        } else if (rating >= starIndex - 0.5) {
          return (
            <FontAwesome
              key={i}
              name="star-half-o"
              size={size}
              color="#00914d"
            />
          );
        } else {
          return (
            <FontAwesome key={i} name="star-o" size={size} color="#585858" />
          );
        }
      })}
    </View>
  );
};

export default StarRating;
