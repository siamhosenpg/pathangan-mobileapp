import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

import ModerationNotice from "@/components/ui/card/postcard/ModerationNotice";
import type { Answer } from "@/types/answerTypes";
import TextFont from "../../font/TextFont";

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
      {/* hidden হলে মালিককে কারণ দেখানো হবে (অন্যদের কাছে notice আসে না) */}
      <ModerationNotice notice={answer.moderationNotice} compact />

      {/* Content */}
      <View className="">
        <TextFont
          className="text-text dark:text-dark-text text-base leading-6"
          numberOfLines={4}
        >
          {answer?.text}
        </TextFont>
      </View>
      {/* Avatar */}
      <View className=" mt-0.5">
        <TextFont className="font-semibold  text-text-tertiary dark:text-dark-text-tertiary text-sm">
          {answer?.userId?.name || "Unknown User"}
        </TextFont>
      </View>
    </TouchableOpacity>
  );
};

export default AnswerCard;
