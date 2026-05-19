import { useGetUserAverageRatingQuery } from "@/redux/api/rating/rattingApi";
import { ActivityIndicator, Text, View } from "react-native";
import StarRating from "./StarRating";

const UserRating = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useGetUserAverageRatingQuery(userId, {
    skip: !userId,
  });

  if (isLoading) {
    return (
      <View className="flex-row items-center gap-3 opacity-30">
        <ActivityIndicator size="small" color="#00914d" />
        <StarRating rating={0} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-row items-center gap-3">
        <StarRating rating={0} />
        <Text className="text-sm font-medium text-text-secondary">
          ০ জন রেটিং দিয়েছে
        </Text>
      </View>
    );
  }

  const totalBangla = toBanglaNumber(data?.totalRatingCount || 0);
  const avgBangla = toBanglaNumber(data?.averageRating || 0);

  return (
    <View className="flex-row items-center gap-3">
      <StarRating rating={data?.averageRating || 0} />
      <Text className="text-sm font-medium text-text-secondary">
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
