import ModerationNotice from "@/components/ui/card/postcard/ModerationNotice";
import type { Answer } from "@/types/answerTypes";
import { Text, View } from "react-native";
import TextFont from "../../font/TextFont";
import { AnswerRating } from "../../star/AnswerRating";
import { AnswerUserCard } from "./AnswerUserCard";

export function AnswerDetail({
  answer,
  Question,
}: {
  answer: Answer;
  Question?: string;
}) {
  return (
    <View className="">
      {/* hidden হলে মালিককে কারণ দেখানো হবে (অন্যদের কাছে notice আসে না) */}
      <ModerationNotice notice={answer.moderationNotice} compact />

      {/* ✅ questionText পাঠানো হচ্ছে যাতে edit popup এ প্রশ্ন দেখা যায় */}
      <AnswerUserCard answer={answer} questionText={Question} />
      <TextFont className="text-base font-semibold text-text dark:text-dark-text mb-2 mt-2 leading-relaxed">
        {Question}
      </TextFont>

      {/* উত্তরের মূল টেক্সট */}
      <TextFont className=" text-text dark:text-dark-text leading-relaxed">
        {answer.text}
      </TextFont>

      {/* রেটিং component */}
      <AnswerRating answerId={answer._id} />

      {/* vote ও best answer */}
      <View className="flex-row items-center gap-4 mt-4 pt-4 ">
        {answer.isBestAnswer && (
          <View className="ml-auto bg-accent/10 px-2.5 py-1 rounded-full">
            <Text className="text-xs font-medium text-accent">
              সেরা উত্তর ✓
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
