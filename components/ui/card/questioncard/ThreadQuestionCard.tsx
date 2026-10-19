import type {
  PrivateQuestion,
  QuestionMode,
} from "@/types/privateQuestionTypes";
import { Text, TouchableOpacity, View } from "react-native";

const STATUS = {
  pending: {
    label: "অপেক্ষমান",
    badge: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  answered: {
    label: "উত্তর দেওয়া হয়েছে",
    badge: "bg-accent/10",
    text: "text-accent",
  },
  ignored: {
    label: "উপেক্ষা করা হয়েছে",
    badge: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-500",
  },
} as const;

interface Props {
  question: PrivateQuestion;
  mode: QuestionMode;
  onPress: (id: string) => void;
}

const ThreadQuestionCard = ({ question, mode, onPress }: Props) => {
  const status = STATUS[question.status] ?? STATUS.pending;
  const isUnread = mode === "inbox" && !question.isRead;

  return (
    <TouchableOpacity
      onPress={() => onPress(question._id)}
      activeOpacity={0.72}
      className={`mx-4 mb-3 rounded-2xl border p-4 ${
        isUnread
          ? "border-accent/30 bg-accent/5 dark:bg-accent/10"
          : "border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary"
      }`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
            {new Date(question.createdAt).toLocaleDateString("bn-BD", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          {question.isEdited && (
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              · সম্পাদিত
            </Text>
          )}
        </View>

        <View className={`px-2.5 py-1 rounded-full ${status.badge}`}>
          <Text className={`text-xs font-medium ${status.text}`}>
            {status.label}
          </Text>
        </View>
      </View>

      <Text
        className="text-sm text-text dark:text-dark-text leading-relaxed"
        numberOfLines={4}
      >
        {question.questionText}
      </Text>

      {question.answer && (
        <View className="mt-3 p-3 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/20">
          <Text className="text-xs font-semibold text-accent mb-1">উত্তর</Text>
          <Text
            className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed"
            numberOfLines={3}
          >
            {question.answer.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ThreadQuestionCard;
