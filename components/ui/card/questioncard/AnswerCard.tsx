import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import type { Answer } from "@/types/answerTypes";

interface Props {
  answer: Answer;
  questionId: string;
}

const AnswerCard = ({ answer }: Props) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/answer/${answer._id}` as any)}
      activeOpacity={0.7}
      className="  py-1 rounded-lg  "
    >
      {/* Content */}
      <View className="">
        <Text
          className="text-text dark:text-dark-text text-base leading-6"
          numberOfLines={4}
        >
          {answer.text}
        </Text>
      </View>
      {/* Avatar */}
      <View className=" mt-0.5">
        <Text className="font-semibold  text-text-tertiary dark:text-dark-text-tertiary text-sm">
          {answer.userId.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AnswerCard;
