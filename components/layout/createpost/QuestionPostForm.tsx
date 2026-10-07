import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";

  // Tag preview chips
  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  return (
    <View className="gap-2">
      {/* Question */}
      <View className="py-1">
        <TextInput
          value={questionText}
          onChangeText={setQuestionText}
          placeholder={t("postData.questionPlaceholder")}
          placeholderTextColor={ph}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="text-text dark:text-dark-text"
          style={{ minHeight: 100 }}
        />
      </View>

      {/* Tags */}
      <View className="flex-row items-center gap-2 border-t border-border dark:border-dark-border">
        <Ionicons
          name="pricetag-outline"
          size={16}
          color={isDark ? "#666" : "#999"}
        />
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder={t("postData.tagsPlaceholder")}
          placeholderTextColor={ph}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-text dark:text-dark-text text-sm py-3"
        />
      </View>

      {parsedTags.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {parsedTags.map((tag, i) => (
            <View
              key={`${tag}-${i}`}
              className="bg-accent/10 px-2.5 py-1 rounded-full"
            >
              <Text className="text-accent text-xs font-medium">#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default QuestionPostForm;
