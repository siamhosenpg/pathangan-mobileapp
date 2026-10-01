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

const ACCENT = "#00914d";

const QuestionPostForm = ({
  questionText,
  setQuestionText,
  tags,
  setTags,
  isDark,
}: Props) => {
  const { t } = useTranslation();
  const ph = isDark ? "#4a4a4a" : "#a0a0a0";
  const bg = "bg-background-secondary dark:bg-dark-background-secondary";
  const border = "border border-border dark:border-dark-border";

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
    <View className="gap-4">
      {/* Info banner */}
      <View className="flex-row items-start gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-4 py-3">
        <Ionicons name="help-circle" size={20} color={ACCENT} />
        <Text className="text-text-secondary dark:text-dark-text-secondary text-sm flex-1 leading-5">
          {t("postData.questionBanner")}
        </Text>
      </View>

      {/* Question */}
      <View className="gap-2">
        <Text className="text-text dark:text-dark-text text-sm font-semibold px-1">
          {t("postData.questionLabel")}
        </Text>
        <View className={`${border} ${bg} rounded-2xl px-4 py-3`}>
          <TextInput
            value={questionText}
            onChangeText={setQuestionText}
            placeholder={t("postData.questionPlaceholder")}
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
          {t("postData.tagsLabel")}
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
            placeholder={t("postData.tagsPlaceholder")}
            placeholderTextColor={ph}
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 text-text dark:text-dark-text text-sm py-3.5"
          />
        </View>

        {parsedTags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 px-1">
            {parsedTags.map((tag, i) => (
              <View
                key={`${tag}-${i}`}
                className="flex-row items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-full"
              >
                <Text className="text-accent text-xs font-medium">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default QuestionPostForm;
