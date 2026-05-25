import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
// import { useGetRatingsByAnswerQuery } from "@/redux/api/rating/ratingApi"; // পরে uncomment করো
// import StarRating from "@/components/ui/star/StarRating"; // পরে uncomment করো
import type { Answer } from "@/types/answerTypes";

interface Props {
  answer: Answer;
  questionId: string;
}

const AnswerCard = ({ answer, questionId }: Props) => {
  const router = useRouter();

  // const { data: ratingStats } = useGetRatingsByAnswerQuery(answer._id);
  // const averageRating = ratingStats?.averageRating ?? 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/answer/${answer._id}` as any)}
      activeOpacity={0.7}
      className="flex-col-reverse  p-3 rounded-lg  bg-background-secondary dark:bg-dark-background-secondary"
    >
      {/* Avatar */}
      <View className="flex-row items-center gap-3">
        <Text className="font-semibold  text-text-tertiary dark:text-dark-text-tertiary text-sm">
          {answer.userId.name}
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-text dark:text-dark-text text-base leading-6"
          numberOfLines={4}
        >
          {answer.text}
        </Text>

        <View className="flex-row items-center gap-4 mt-1">
          {/* Rating */}
          {/* {averageRating > 0 && (
            <StarRating rating={averageRating} />
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AnswerCard;
