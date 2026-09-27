import { useCreateAnswerMutation } from "@/redux/api/answer/answersApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useBottomSheet } from "../../bottom-sheet/useBottomSheet";

interface Props {
  questionId: string;
  questionText: string;
}

const AnswerPopupContent = ({ questionId, questionText }: Props) => {
  const { close } = useBottomSheet();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [createAnswer, { isLoading }] = useCreateAnswerMutation();
  const { t } = useTranslation();

  // ✅ text থাকলে close করার আগে confirm popup দেখানো
  const handleClose = () => {
    if (answer.trim().length > 0) {
      Alert.alert(
        t("areyouSure"),
        t("discardAnswer"),
        [
          {
            text: t("cancel"),
            style: "cancel",
          },
          {
            text: t("goBack"),
            style: "destructive",
            onPress: () => close(),
          },
        ],
        { cancelable: true },
      );
      return;
    }
    close();
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    if (answer.trim().length < 5) {
      setError("উত্তর কমপক্ষে ৫ অক্ষরের হতে হবে");
      return;
    }
    setError("");
    try {
      await createAnswer({ questionId, text: answer.trim() }).unwrap();
      setAnswer("");
      close();
    } catch (err: any) {
      const msg = err?.data?.message;
      if (msg === t("alreadyAnswered")) {
        setError(t("alreadyAnswered"));
      } else {
        setError(msg || t("somthingWentWrong"));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-4">
          {/* Header: close button যোগ করা হলো, যাতে guard লজিক ট্রিগার করা যায় */}
          <View className="flex-row items-center justify-between pt-2 pb-1">
            <Text className="text-sm font-semibold text-text dark:text-dark-text">
              {t("answerPlaceholder")}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Question preview */}
          <View className="px-1 py-3 mb-3 border-b border-border dark:border-dark-border">
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-1">
              {t("question")}:
            </Text>
            <Text className="text-sm font-semibold text-text dark:text-dark-text leading-snug">
              {questionText}
            </Text>
          </View>

          {/* TextInput */}
          <TextInput
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              if (error) setError("");
            }}
            placeholder={t("answerPlaceholder")}
            placeholderTextColor="#9CA3AF"
            multiline
            scrollEnabled
            textAlignVertical="top"
            className="text-sm text-text dark:text-dark-text bg-background-secondary dark:bg-dark-background-secondary rounded-xl px-4 py-3"
            style={{
              minHeight: 120,
              maxHeight: 180,
              borderColor: error ? "#EF4444" : "transparent",
              borderWidth: 1,
            }}
          />

          {error ? (
            <Text className="text-xs text-red-500 mt-1">{error}</Text>
          ) : null}

          {/* Footer */}
          <View className="flex-row items-center justify-between py-4">
            <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
              {answer.length} {t("characters")}
            </Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!answer.trim() || isLoading}
              className="flex-row items-center gap-2 px-5 py-2 rounded-full bg-accent"
              style={{ opacity: !answer.trim() || isLoading ? 0.4 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send-outline" size={15} color="#fff" />
              )}
              <Text className="text-white text-sm font-medium">
                {isLoading ? t("posting") : t("submitAnswer")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AnswerPopupContent;
