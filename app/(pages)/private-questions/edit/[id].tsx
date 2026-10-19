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
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIMITS = {
  question: { min: 1, max: 1000 },
  answer: { min: 5, max: 2000 },
} as const;

const EditPrivateContentPage = () => {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const isAnswer = type === "answer";
  const limit = isAnswer ? LIMITS.answer : LIMITS.question;

  const { data: qData, isLoading: qLoading } =
    useGetPrivateQuestionByIdQuery(id);
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
  const trimmed = text.trim();
  const isChanged = trimmed !== (originalText ?? "").trim();
  const canSave =
    isChanged &&
    trimmed.length >= limit.min &&
    trimmed.length <= limit.max &&
    !saving;

  // অনুমতি: প্রশ্ন শুধু sender, উত্তর শুধু receiver edit করতে পারবে
  const allowed = isAnswer ? !!question?.isReceiver : !!question?.isSender;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      if (isAnswer) {
        if (!answer) return;
        await editAnswer({ answerId: answer._id, text: trimmed }).unwrap();
      } else {
        await editQuestion({ id, questionText: trimmed }).unwrap();
      }
      router.back();
    } catch (err) {
      Alert.alert("ত্রুটি", getErrorMessage(err));
    }
  };

  const handleBack = () => {
    if (isChanged && !saving) {
      Alert.alert(
        "পরিবর্তন বাতিল করবেন?",
        "আপনার করা পরিবর্তন সেভ হয়নি। বের হয়ে গেলে হারিয়ে যাবে।",
        [
          { text: "থাকুন", style: "cancel" },
          {
            text: "বের হয়ে যান",
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
          এটি পাওয়া যায়নি অথবা আপনার এটি সম্পাদনা করার অনুমতি নেই
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-accent font-semibold">ফিরে যান</Text>
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
          {isAnswer ? "উত্তর সম্পাদনা" : "প্রশ্ন সম্পাদনা"}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          className={`px-5 py-2 rounded-full ${
            canSave
              ? "bg-accent"
              : "bg-background-tertiary dark:bg-dark-background-tertiary"
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              className={`text-sm font-semibold ${
                canSave
                  ? "text-white"
                  : "text-text-tertiary dark:text-dark-text-tertiary"
              }`}
            >
              সেভ
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-4 pt-4">
        {/* উত্তর edit করার সময় প্রশ্নটা উপরে দেখাই, যাতে context মনে থাকে */}
        {isAnswer && (
          <View className="mb-4 p-3 rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary">
            <Text className="text-xs font-semibold text-text-tertiary dark:text-dark-text-tertiary mb-1">
              প্রশ্ন
            </Text>
            <Text
              className="text-sm text-text-secondary dark:text-dark-text-secondary"
              numberOfLines={3}
            >
              {question.questionText}
            </Text>
          </View>
        )}

        <View className="rounded-2xl border border-border dark:border-dark-border bg-background-secondary dark:bg-dark-background-secondary p-3">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              isAnswer ? "আপনার উত্তর লিখুন..." : "আপনার প্রশ্ন লিখুন..."
            }
            placeholderTextColor={isDark ? "#8a8a8a" : "#6d6d6d"}
            multiline
            autoFocus
            maxLength={limit.max + 100}
            textAlignVertical="top"
            className="text-sm text-text dark:text-dark-text leading-relaxed min-h-[160px] max-h-[320px]"
          />
        </View>

        <View className="flex-row items-center justify-between mt-2 px-1">
          <Text className="text-xs text-text-tertiary dark:text-dark-text-tertiary">
            সংরক্ষণ করলে "সম্পাদিত" লেখা দেখাবে
          </Text>
          <Text
            className={`text-xs ${
              text.length > limit.max
                ? "text-red-500"
                : "text-text-tertiary dark:text-dark-text-tertiary"
            }`}
          >
            {text.length}/{limit.max}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditPrivateContentPage;
