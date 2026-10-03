import { useGetUserAverageRatingQuery } from "@/redux/api/rating/rattingApi";
import { ActivityIndicator, Text, View } from "react-native";
import StarRating from "./StarRating";

interface Props {
  userId?: string;
  // ✅ profile data থেকে সরাসরি দিলে আলাদা API call হবে না
  averageRating?: number;
  totalRatingCount?: number;
}

const UserRating = ({ userId, averageRating, totalRatingCount }: Props) => {
  // props এ rating থাকলে query skip হবে (profile page এ এটাই হবে)
  const hasInlineData =
    averageRating !== undefined && totalRatingCount !== undefined;

  const { data, isLoading, isError } = useGetUserAverageRatingQuery(
    userId as string,
    { skip: hasInlineData || !userId },
  );

  const avg = hasInlineData ? averageRating : data?.averageRating;
  const total = hasInlineData ? totalRatingCount : data?.totalRatingCount;

  if (!hasInlineData && isLoading) {
    return (
      <View className="flex-row items-center gap-3 opacity-30">
        <ActivityIndicator size="small" color="#00914d" />
        <StarRating rating={0} />
      </View>
    );
  }

  if (!hasInlineData && (isError || !data)) {
    return (
      <View className="flex-row items-center gap-3">
        <StarRating rating={0} />
        <Text className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
          ০ জন রেটিং দিয়েছে
        </Text>
      </View>
    );
  }

  const totalBangla = toBanglaNumber(total || 0);

  return (
    <View className="flex-row items-center gap-3">
      <StarRating rating={avg || 0} />
      <Text className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
        {totalBangla} জন রেটিং দিয়েছে
      </Text>
    </View>
  );
};

// BanglaNumber web component এর বদলে simple helper
function toBanglaNumber(value: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
}

export default UserRating;
