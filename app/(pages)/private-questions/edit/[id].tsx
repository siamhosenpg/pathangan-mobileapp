import {
  useEditPrivateAnswerMutation,
  useGetPrivateAnswerByQuestionQuery,
} from "@/redux/api/answer/privateAnswerApi";
import {
  useEditPrivateQuestionMutation,
  useGetPrivateQuestionByIdQuery,
} from "@/redux/api/privateQuestion/privateQuestionApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIMITS = {
  question: { min: 1, max: 1000 },
  answer: { min: 15, max: 2000 },
} as const;

const EditPrivateContentPage = () => {
  const { t } = useTranslation();
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const isAnswer = type === "answer";
  const limit = isAnswer ? LIMITS.answer : LIMITS.question;

  const { data: qData, isLoading: qLoading } = useGetPrivateQuestionByIdQuery(
    id,
    { skip: !id },
  );
  const { data: aData, isLoading: aLoading } =
    useGetPrivateAnswerByQuestionQuery(id, { skip: !id || !isAnswer });

  const [editQuestion, { isLoading: savingQ }] =
    useEditPrivateQuestionMutation();
  const [editAnswer, { isLoading: savingA }] = useEditPrivateAnswerMutation();

  const question = qData?.question;
  const answer = aData?.answer ?? null;

  const originalText = isAnswer ? answer?.text : question?.questionText;

  const [text, setText] = useState("");
  const [initialized, setInitialized] = useState(false);

  // আসল লেখা একবারই input এ বসবে
  useEffect(() => {
    if (!initialized && originalText !== undefined) {
      setText(originalText);
      setInitialized(true);
    }
  }, [originalText, initialized]);

  const saving = savingQ || savingA;
  const charCount = text.length;
  const trimmed = text.trim();
  const trimmedLength = trimmed.length;
  const remaining = limit.min - trimmedLength;
  const isChanged = trimmed !== (originalText ?? "").trim();
  const canSave =
    isChanged &&
    trimmedLength >= limit.min &&
    trimmedLength <= limit.max &&
    charCount <= limit.max &&
    !saving;

  // অনুমতি: প্রশ্ন শুধু sender, উত্তর শুধু receiver edit করতে পারবে
  const allowed = isAnswer ? !!question?.isReceiver : !!question?.isSender;

  const handleSave = async () => {
    if (!canSave) return;
    Keyboard.dismiss();
    try {
      if (isAnswer) {
        if (!answer) return;
        await editAnswer({ answerId: answer._id, text: trimmed }).unwrap();
      } else {
        await editQuestion({ id, questionText: trimmed }).unwrap();
      }
      router.back();
    } catch (err) {
      Alert.alert(t("privateData.error"), getErrorMessage(err));
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (isChanged && !saving) {
      Alert.alert(
        t("privateData.discardTitle"),
        t("privateData.discardMessage"),
        [
          { text: t("privateData.stay"), style: "cancel" },
          {
            text: t("privateData.leave"),
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
      return;
    }
    router.back();
  };

  const loading = qLoading || (isAnswer && aLoading);

  if (loading) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-background items-center justify-center">
        <ActivityIndicator size="large" color="#00914d" />
      </View>
    );
  }

  if (!question || !allowed || (isAnswer && !answer)) {
    return (
      <View
        className="flex-1 bg-background dark:bg-dark-background items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-text-tertiary dark:text-dark-text-tertiary text-center">
          {t("privateData.notAllowed")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-accent font-semibold">
            {t("privateData.goBack")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ paddingTop: insets.top }}
    >
      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
        <TouchableOpacity
          onPress={handleBack}
          className="mr-3 w-9 h-9 rounded-full items-center justify-center bg-background-secondary dark:bg-dark-background-secondary"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#f1f1f1" : "#1b1b1b"}
          />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-text dark:text-dark-text flex-1">
          {isAnswer
            ? t("privateData.editAnswer")
            : t("privateData.editQuestion")}
        </Text>
      </View>

      {/* ── উত্তর edit করার সময় প্রশ্নটা উপরে ফিক্সড (বেশি বড় হলে ভেতরে স্ক্রল) ── */}
      {isAnswer && (
        <View className="max-h-[30%] border-b border-border dark:border-dark-border">
          <ScrollView
            className="p-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-xs font-semibold text-text-tertiary dark:text-dark-text-tertiary uppercase mb-2">
              {t("privateData.question")}
            </Text>
            <Text className="text-base text-text font-medium dark:text-dark-text leading-relaxed">
              {question.questionText}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* ── Input: বাকি পুরো জায়গা নেয়, লেখা বেশি হলে ভেতরে স্ক্রল হয়,
           তাই কার্সর সবসময় visible থাকে ── */}
      <View className="flex-1 px-5 pt-4">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            isAnswer
              ? t("privateData.answerPlaceholder")
              : t("privateData.questionPlaceholder")
          }
          placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
          multiline
          autoFocus
          scrollEnabled
          maxLength={limit.max + 100}
          textAlignVertical="top"
          className="flex-1 text-base text-text dark:text-dark-text leading-relaxed"
        />
      </View>

      {/* ── Fixed bottom bar: character count + save button ── */}
      <View
        className="px-4 pt-3 border-t border-border dark:border-dark-border bg-background dark:bg-dark-background flex-row items-center justify-between"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-1 pr-3">
          <Text
            className={`text-xs ${
              charCount > limit.max
                ? "text-red-500"
                : "text-text-tertiary dark:text-dark-text-tertiary"
            }`}
          >
            {charCount}/{limit.max}
          </Text>
          {trimmedLength > 0 && remaining > 0 ? (
            <Text className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
              {t("privateData.minCharsHint", {
                num: remaining,
                min: limit.min,
              })}
            </Text>
          ) : (
            <Text
              className="text-xs text-text-tertiary dark:text-dark-text-tertiary mt-0.5"
              numberOfLines={1}
            >
              {t("privateData.editedNote")}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full ${
            canSave
              ? "bg-accent"
              : "bg-background-tertiary dark:bg-dark-background-tertiary"
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={16}
                color={canSave ? "#fff" : isDark ? "#8a8a8a" : "#6d6d6d"}
              />
              <Text
                className={`text-sm font-semibold ${
                  canSave
                    ? "text-white"
                    : "text-text-tertiary dark:text-dark-text-tertiary"
                }`}
              >
                {t("privateData.save")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditPrivateContentPage;
