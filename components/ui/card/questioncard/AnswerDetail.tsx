import type { Answer } from "@/types/answerTypes";
import { Text, View } from "react-native";
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
      {/* ✅ questionText পাঠানো হচ্ছে যাতে edit popup এ প্রশ্ন দেখা যায় */}
      <AnswerUserCard answer={answer} questionText={Question} />
      <Text className="text-base font-semibold text-text dark:text-dark-text mb-2 mt-2 leading-relaxed">
        {Question}
      </Text>

      {/* উত্তরের মূল টেক্সট */}
      <Text className=" text-text dark:text-dark-text leading-relaxed">
        {answer.text}
      </Text>

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
