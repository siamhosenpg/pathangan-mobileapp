import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

interface Props {
  questionText: string;
  setQuestionText: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
  isDark: boolean;
}

const QuestionPostForm = ({
  questionText,
  setQuestionText,
  tags,
  setTags,
  isDark,
}: Props) => {
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";
  const bg = "bg-background-secondary dark:bg-dark-background-secondary";
  const border = "border border-border dark:border-dark-border";

  return (
    <View className="gap-4">
      {/* Info banner */}
      <View className="flex-row items-start gap-3 bg-accent/8 border border-accent/20 rounded-2xl px-4 py-3">
        <Ionicons name="help-circle" size={20} color="#6366f1" />
        <Text className="text-text-secondary dark:text-dark-text-secondary text-sm flex-1 leading-5">
          একটি ভালো প্রশ্ন করুন — বিস্তারিত লিখলে ভালো উত্তর পাওয়ার সম্ভাবনা
          বেশি।
        </Text>
      </View>

      {/* Question */}
      <View className="gap-2">
        <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
          প্রশ্ন *
        </Text>
        <View className={`${border} ${bg} rounded-2xl px-4 py-3`}>
          <TextInput
            value={questionText}
            onChangeText={setQuestionText}
            placeholder="আপনার প্রশ্নটি বিস্তারিতভাবে লিখুন..."
            placeholderTextColor={ph}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="text-text dark:text-dark-text text-sm"
            style={{ minHeight: 110 }}
          />
        </View>
      </View>

      {/* Tags */}
      <View className="gap-2">
        <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
          ট্যাগ
        </Text>
        <View
          className={`flex-row items-center ${border} ${bg} rounded-2xl px-4 gap-3`}
        >
          <Ionicons
            name="pricetag-outline"
            size={16}
            color={isDark ? "#666" : "#999"}
          />
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="react, nextjs (কমা দিয়ে আলাদা করুন)"
            placeholderTextColor={ph}
            className="flex-1 text-text dark:text-dark-text text-sm py-3.5"
          />
        </View>
      </View>
    </View>
  );
};

export default QuestionPostForm;
