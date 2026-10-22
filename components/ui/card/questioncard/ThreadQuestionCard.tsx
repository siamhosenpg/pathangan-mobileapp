import type {
  PrivateQuestion,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { getDateLocale } from "./PrivateQuestionPersonCard";

const STATUS = {
  pending: {
    labelKey: "privateData.statusPending",

    text: "text-yellow-700 dark:text-yellow-400",
  },
  answered: {
    labelKey: "privateData.statusAnswered",

    text: "text-accent",
  },
  ignored: {
    labelKey: "privateData.statusIgnored",

    text: "text-red-500",
  },
} as const;

interface Props {
  question: PrivateQuestion;
  mode: QuestionMode;
  onPress: (id: string) => void;
}

const ThreadQuestionCard = ({ question, mode, onPress }: Props) => {
  const { t, i18n } = useTranslation();
  const status = STATUS[question.status] ?? STATUS.pending;
  const isUnread = mode === "inbox" && !question.isRead;

  return (
    <TouchableOpacity
      onPress={() => onPress(question._id)}
      activeOpacity={0.72}
      className={` border-b border-border dark:border-dark-border p-5 ${
        isUnread ? "border-accent/30" : "border-border dark:border-dark-border "
      }`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {new Date(question.createdAt).toLocaleDateString(
              getDateLocale(i18n.language),
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            )}
          </Text>
          {question.isEdited && (
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              · {t("privateData.edited")}
            </Text>
          )}
        </View>

        <View className={` rounded-full`}>
          <Text className={`text-xs font-bold ${status.text}`}>
            {t(status.labelKey)}
          </Text>
        </View>
      </View>

      <Text
        className=" text-text font-medium dark:text-dark-text leading-relaxed"
        numberOfLines={2}
      >
        {question.questionText}
      </Text>

      {question.answer && (
        <View className="mt-2  ">
          <Text
            className=" text-text-secondary dark:text-dark-text-secondary leading-relaxed"
            numberOfLines={2}
          >
            {question.answer.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ThreadQuestionCard;
